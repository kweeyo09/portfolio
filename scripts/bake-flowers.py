"""
Bake the homepage flower GLBs into compact particle files.

The homepage used to download ~16 MB of GLB models and sample 60k particles
per flower on the main thread. This does that sampling once, offline, and
writes small binary files the page can upload straight to the GPU.

Each flower is also centred on its bounding box and scaled to fit the same
on-screen box, so the three read at a consistent size.

Output format (little-endian):
  uint32           particle count N
  int16[N * 3]     position xyz, divided by POS_SCALE
  uint8[N * 3]     colour rgb

Usage: python scripts/bake-flowers.py
"""

import hashlib
import io
import json
import struct
from pathlib import Path

import numpy as np
from PIL import Image

ASSETS = Path(__file__).resolve().parent.parent / "client" / "public" / "assets"

FLOWERS = [
    ("baihe_4774bde5.glb", "flower-lily"),
    ("lotus_f4ee305b.glb", "flower-lotus"),
    ("anthurium_f0a39f13.glb", "flower-anthurium"),
]

N_PARTICLES = 60_000
# Every flower is scaled to fit inside this box (world units), measured as the
# full width swept while spinning around Y, and the height.
BOX_WIDTH = 2.7
BOX_HEIGHT = 1.8
POS_SCALE = 1 / 8192  # int16 range covers +-4 world units

COMPONENTS = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
WIDTHS = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}


def read_glb(path):
    data = path.read_bytes()
    json_len = struct.unpack_from("<I", data, 12)[0]
    gltf = json.loads(data[20:20 + json_len])
    bin_start = 20 + json_len + 8
    bin_len = struct.unpack_from("<I", data, 20 + json_len)[0]
    return gltf, data[bin_start:bin_start + bin_len]


def accessor(gltf, binary, idx):
    acc = gltf["accessors"][idx]
    view = gltf["bufferViews"][acc["bufferView"]]
    dtype = np.dtype(COMPONENTS[acc["componentType"]])
    width = WIDTHS[acc["type"]]
    start = view.get("byteOffset", 0) + acc.get("byteOffset", 0)
    stride = view.get("byteStride") or dtype.itemsize * width
    count = acc["count"]
    raw = np.frombuffer(binary, dtype=np.uint8, count=stride * (count - 1) + dtype.itemsize * width, offset=start)
    rows = np.lib.stride_tricks.as_strided(raw, shape=(count, dtype.itemsize * width), strides=(stride, 1))
    out = np.ascontiguousarray(rows).view(dtype).reshape(count, width).astype(np.float64)
    if acc.get("normalized") and dtype != np.float32:
        out /= np.iinfo(dtype).max
    return out


def texture_pixels(gltf, binary, tex_index):
    image = gltf["images"][gltf["textures"][tex_index]["source"]]
    view = gltf["bufferViews"][image["bufferView"]]
    start = view.get("byteOffset", 0)
    img = Image.open(io.BytesIO(binary[start:start + view["byteLength"]])).convert("RGB")
    return np.asarray(img)


def bake(src, dst, rng):
    gltf, binary = read_glb(ASSETS / src)
    tris, colours, areas = [], [], []

    for mesh in gltf["meshes"]:
        for prim in mesh["primitives"]:
            pos = accessor(gltf, binary, prim["attributes"]["POSITION"])
            if "indices" in prim:
                idx = accessor(gltf, binary, prim["indices"]).astype(np.int64).reshape(-1, 3)
            else:
                idx = np.arange(len(pos)).reshape(-1, 3)
            tri = pos[idx]  # (F, 3 verts, 3)
            area = 0.5 * np.linalg.norm(np.cross(tri[:, 0] - tri[:, 1], tri[:, 0] - tri[:, 2]), axis=1)

            # Colour each triangle from the texture at its UV centroid; this
            # avoids bleeding across UV island seams.
            mat = gltf["materials"][prim["material"]] if "material" in prim else {}
            base_tex = mat.get("pbrMetallicRoughness", {}).get("baseColorTexture")
            if base_tex is not None and "TEXCOORD_0" in prim["attributes"]:
                uv = accessor(gltf, binary, prim["attributes"]["TEXCOORD_0"])[idx].mean(axis=1)
                px = texture_pixels(gltf, binary, base_tex["index"])
                h, w = px.shape[:2]
                x = np.clip((np.clip(uv[:, 0], 0, 1) * w).astype(int), 0, w - 1)
                y = np.clip((np.clip(uv[:, 1], 0, 1) * h).astype(int), 0, h - 1)
                col = px[y, x]
            else:
                factor = mat.get("pbrMetallicRoughness", {}).get("baseColorFactor", [1, 1, 1, 1])
                col = np.tile((np.array(factor[:3]) * 255).astype(np.uint8), (len(tri), 1))

            keep = area > 1e-10
            tris.append(tri[keep])
            colours.append(col[keep])
            areas.append(area[keep])

    tri = np.concatenate(tris)
    col = np.concatenate(colours)
    area = np.concatenate(areas)

    # Area-weighted triangle choice, uniform point inside each triangle
    pick = rng.choice(len(tri), size=N_PARTICLES, p=area / area.sum())
    u1, u2 = rng.random(N_PARTICLES), rng.random(N_PARTICLES)
    flip = u1 + u2 > 1
    u1[flip], u2[flip] = 1 - u1[flip], 1 - u2[flip]
    u3 = 1 - u1 - u2
    t = tri[pick]
    pts = u1[:, None] * t[:, 0] + u2[:, None] * t[:, 1] + u3[:, None] * t[:, 2]
    rgb = col[pick].astype(np.uint8)

    # Centre on the bounding box (ignoring a few stray points) and fit the box
    lo, hi = np.percentile(pts, 0.1, axis=0), np.percentile(pts, 99.9, axis=0)
    pts -= (lo + hi) / 2
    radius = np.percentile(np.hypot(pts[:, 0], pts[:, 2]), 99.9)
    height = hi[1] - lo[1]
    scale = min(BOX_WIDTH / (2 * radius), BOX_HEIGHT / height)
    pts *= scale

    q = np.clip(np.round(pts / POS_SCALE), -32767, 32767).astype("<i2")
    payload = struct.pack("<I", N_PARTICLES) + q.tobytes() + rgb.tobytes()
    # /assets is served as immutable, so the file name carries a content hash
    out = ASSETS / f"{dst}_{hashlib.sha1(payload).hexdigest()[:8]}.bin"
    for old in ASSETS.glob(f"{dst}_*.bin"):
        old.unlink()
    out.write_bytes(payload)
    print(f"{out.name}: width {2 * radius * scale:.2f}, height {height * scale:.2f}, {len(payload) / 1024:.0f} KB")


if __name__ == "__main__":
    rng = np.random.default_rng(7)
    for src, dst in FLOWERS:
        bake(src, dst, rng)
