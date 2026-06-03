// Replaces the last remaining low-res (1024² screenshot-crop) editorial stills
// used on the About + Lookbook ("journal") pages with HD sources from the IG
// download set. Same HD guard as every other optimizer: anything under
// MIN_SRC_W is skipped and logged, so a low-quality source can never ship.
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "_source-images/ig-downloads-gdl";
const OUT = "public/assets/ig";
mkdirSync(OUT, { recursive: true });
const MIN_SRC_W = 1100;

// outName → { file, w, h }. Portrait heros/stories at 1200w; gallery tiles sized
// to their grid spans. All sources verified ≥1100px wide and previously unused.
const jobs = [
  // About page
  { out: "editorial-about-hero.jpg", file: "2025-12-19_DScQX2vjUgP_1.jpg", w: 1200, h: 1500 }, // hero
  { out: "editorial-craft.jpg",      file: "2026-05-28_DY1nLHbjQNt_1.webp", w: 1200, h: 900 }, // quality 4:3
  // Lookbook story cards (1.2:1)
  { out: "editorial-story-1.jpg", file: "2025-10-22_DQHQnJajEyu_1.jpg", w: 1200, h: 1000 },
  { out: "editorial-story-2.jpg", file: "2026-05-26_DYzPTukNqI3_1.webp", w: 1200, h: 1000 },
  // Lookbook asymmetric gallery tiles
  { out: "editorial-gallery-3.jpg", file: "2026-05-22_DYo0Uh-tv6__1.webp", w: 1200, h: 1200 }, // big 2x2
  { out: "editorial-gallery-4.jpg", file: "2026-05-16_DYZpOWWtKFu_1.webp", w: 1000, h: 1000 }, // 1x1
  { out: "editorial-gallery-5.jpg", file: "2026-01-06_DTKvmZNDbIG_1.jpg", w: 1000, h: 1000 }, // 1x1
  { out: "editorial-gallery-6.jpg", file: "2025-10-16_DP38gQdjBEV_3.jpg", w: 1000, h: 1500 }, // 1x2 tall
  { out: "editorial-gallery-7.jpg", file: "2026-05-22_DYo0V3it7B6_5.webp", w: 1400, h: 800 },  // 2x1 wide
];

for (const j of jobs) {
  const srcPath = path.join(SRC, j.file);
  if (!existsSync(srcPath)) {
    console.error("MISSING SOURCE:", j.file);
    continue;
  }
  const meta = await sharp(srcPath).metadata();
  if ((meta.width ?? 0) < MIN_SRC_W) {
    console.error(`SKIP (low-res ${meta.width}px):`, j.file);
    continue;
  }
  await sharp(srcPath)
    .resize(j.w, j.h, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, j.out));
  console.log(`${j.out}  ←  ${j.file} (${meta.width}×${meta.height})`);
}
console.log("Done.");
