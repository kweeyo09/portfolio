import { writeFile } from 'node:fs/promises';

// Layered apricot dahlia. Bake curved petal surfaces into the same compact
// point format as the other flowers; no extra runtime geometry or animation.
const count = 60000;
const buffer = Buffer.alloc(4 + count * 9);
buffer.writeUInt32LE(count);
let seed = 2917;
const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const rings = [
  { petals: 18, radius: 1.3, base: .44, width: .22, depth: -.12 },
  { petals: 15, radius: 1.06, base: .30, width: .21, depth: .06 },
  { petals: 12, radius: .79, base: .18, width: .19, depth: .23 },
  { petals: 9, radius: .53, base: .07, width: .15, depth: .38 },
  { petals: 7, radius: .29, base: .01, width: .10, depth: .47 },
];
for (let i = 0; i < count; i++) {
  const layer = Math.min(4, Math.floor(Math.pow(random(), 1.65) * 5));
  const ring = rings[layer];
  const petal = Math.floor(random() * ring.petals);
  const u = random(), v = random() * 2 - 1;
  const theta = petal * Math.PI * 2 / ring.petals + layer * .24;
  const radius = ring.base + (ring.radius - ring.base) * u;
  const width = ring.width * Math.pow(Math.sin(Math.PI * u), .55) * v;
  const x = Math.sin(theta) * radius + Math.cos(theta) * width;
  const y = Math.cos(theta) * radius - Math.sin(theta) * width;
  const z = ring.depth + .24 * Math.sin(Math.PI * u) + .16 * v * v - .10 * u;
  const light = u * 48 + Math.abs(v) * 15 + random() * 9;
  const colors = [255 - layer * 5, 105 + light - layer * 8, 51 + light - layer * 5];
  [x, y, z].forEach((value, axis) => buffer.writeInt16LE(Math.round(value * 8192), 4 + i * 6 + axis * 2));
  colors.forEach((value, channel) => { buffer[4 + count * 6 + i * 3 + channel] = Math.round(value); });
}
await writeFile(new URL('../client/public/assets/flower-experiments-dahlia-v2.bin', import.meta.url), buffer);
