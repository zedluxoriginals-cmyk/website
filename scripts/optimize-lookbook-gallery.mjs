// Regenerates the lookbook mosaic gallery with curated LIFESTYLE shots (no product
// flat-lays / promo-text graphics) cropped to each mosaic slot's aspect ratio so the
// grid packs into a clean rectangle with zero black gaps. HD guard as always.
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "_source-images/ig-downloads-gdl";
const OUT = "public/assets/ig";
mkdirSync(OUT, { recursive: true });
const MIN_SRC_W = 1100;

// Mosaic packs a 4-col × 3-row block (12 cells, ~200px rows):
//   [ FEATURE 2x2 ][ A 1x1 ][ B 1x1 ]
//   [ FEATURE     ][ C wide 2x1     ]
//   [ D 1x1 ][ E 1x1 ][ F wide 2x1  ]
// Aspect ratios match the slot so object-cover crops minimally.
const jobs = [
  { out: "lookbook-feature.jpg", file: "2025-12-19_DScQX2vjUgP_1.jpg", w: 1000, h: 1000 }, // 2x2 square hero
  { out: "lookbook-a.jpg",       file: "2025-10-22_DQHQnJajEyu_1.jpg", w: 800,  h: 800 },  // 1x1
  { out: "lookbook-b.jpg",       file: "2026-05-16_DYZpOWWtKFu_1.webp", w: 800,  h: 800 },  // 1x1
  { out: "lookbook-c.jpg",       file: "2025-11-24_DRcTbICjDid_1.jpg", w: 1400, h: 700 },  // 2x1 wide
  { out: "lookbook-d.jpg",       file: "2026-01-06_DTKvmZNDbIG_1.jpg", w: 800,  h: 800 },  // 1x1
  { out: "lookbook-e.jpg",       file: "2026-05-20_DYjzrklND1T_1.webp", w: 800,  h: 800 },  // 1x1
  { out: "lookbook-f.jpg",       file: "2026-05-18_DYfFhc8Nd70_1.webp", w: 1400, h: 700 },  // 2x1 wide
];

for (const j of jobs) {
  const srcPath = path.join(SRC, j.file);
  if (!existsSync(srcPath)) { console.error("MISSING SOURCE:", j.file); continue; }
  const meta = await sharp(srcPath).metadata();
  if ((meta.width ?? 0) < MIN_SRC_W) { console.error(`SKIP (low-res ${meta.width}px):`, j.file); continue; }
  await sharp(srcPath)
    .resize(j.w, j.h, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, j.out));
  console.log(`${j.out}  ←  ${j.file} (${meta.width}×${meta.height})`);
}
console.log("Done.");
