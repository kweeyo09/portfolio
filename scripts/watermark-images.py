"""
Watermark the portfolio images and tag them with copyright metadata.

Reads the clean, web-sized sources in originals/ (kept locally, not deployed),
draws a small "(c) kixizz.com" mark in the bottom-right corner, embeds EXIF
copyright, and writes content-hashed WebP files to client/public/assets,
updating the references in client/src.

To add a new image: drop a web-sized PNG/WebP into originals/ named like the
asset (e.g. originals/hk-zine-07.png), reference /assets/hk-zine-07_00000000.webp
in the code, then run: python scripts/watermark-images.py
"""

import datetime
import glob
import hashlib
import io
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageStat

ROOT = Path(__file__).resolve().parent.parent
ORIGINALS = ROOT / "originals"
ASSETS = ROOT / "client" / "public" / "assets"
SRC = ROOT / "client" / "src"
FONT = ROOT / "scripts" / "fonts" / "Barlow-Medium.ttf"

MARK = "© kixizz.com"
OWNER = "KIXIZZ STUDIO"
# EXIF text fields are ASCII-only, so no © symbol here
COPYRIGHT = f"Copyright {datetime.date.today().year} {OWNER} (kixizz.com). All rights reserved."

EXIF_ARTIST = 0x013B
EXIF_COPYRIGHT = 0x8298
EXIF_DESCRIPTION = 0x010E


def watermark(img):
    w, h = img.size
    size = round(min(36, max(14, w * 0.022)))
    font = ImageFont.truetype(str(FONT), size)
    left, top, right, bottom = font.getbbox(MARK)
    margin = round(size * 1.2)
    x, y = w - margin - right, h - margin - bottom

    # Light ink on dark corners, dark ink on light corners
    corner = img.crop((x + left, y + top, x + right, y + bottom)).convert("L")
    luma = ImageStat.Stat(corner).mean[0]
    ink = (0, 0, 0, 110) if luma > 150 else (255, 255, 255, 140)

    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).text((x, y), MARK, font=font, fill=ink)
    return Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")


def encode(img, budget):
    exif = Image.Exif()
    exif[EXIF_ARTIST] = OWNER
    exif[EXIF_COPYRIGHT] = COPYRIGHT
    exif[EXIF_DESCRIPTION] = COPYRIGHT
    # Highest quality that stays close to the current file size
    for q in (86, 82, 78, 74, 70, 66):
        buf = io.BytesIO()
        img.save(buf, "WEBP", quality=q, method=6, exif=exif.tobytes())
        if budget is None or buf.tell() <= budget * 1.08:
            break
    return buf.getvalue(), q


def main():
    sources = sorted(glob.glob(str(ORIGINALS / "*.png")) + glob.glob(str(ORIGINALS / "*.webp")))
    code_files = [p for p in SRC.rglob("*") if p.suffix in (".ts", ".tsx")]
    for src in sources:
        base = Path(src).stem
        current = sorted(ASSETS.glob(f"{base}_*.webp"))
        budget = current[0].stat().st_size if current else None

        data, q = encode(watermark(Image.open(src).convert("RGB")), budget)
        name = f"{base}_{hashlib.sha1(data).hexdigest()[:8]}.webp"
        if current and current[0].name == name:
            continue
        for old in current:
            old.unlink()
        (ASSETS / name).write_bytes(data)

        pattern = re.compile(rf"/assets/{re.escape(base)}_[0-9a-f]{{8}}\.webp")
        for f in code_files:
            text = f.read_text(encoding="utf-8")
            new = pattern.sub(f"/assets/{name}", text)
            if new != text:
                f.write_text(new, encoding="utf-8")
        print(f"{name}  q{q}  {len(data) // 1024} KB" + (f"  (was {budget // 1024} KB)" if budget else ""))


if __name__ == "__main__":
    main()
