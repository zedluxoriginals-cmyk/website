// Optimizes HD stills for editorial chrome (page heros + lookbook gallery slots)
// that were still pointing at low-res screenshot crops. Same HD guard as the
// community strip: anything under MIN_SRC_W is skipped.
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "_source-images/ig-downloads-gdl";
const OUT = "public/assets/ig";
mkdirSync(OUT, { recursive: true });
const MIN_SRC_W = 1100;

// outName → { file, w, h }. Portrait heros at 1200w, gallery slots at 1200w.
const jobs = [
  { out: "editorial-hero.jpg", file: "2025-02-11_DF7xXZEoOzz_1.jpg", w: 1200, h: 1500 },
  { out: "editorial-gallery-1.jpg", file: "2025-11-19_DRPOgkpjbkE_1.jpg", w: 1200, h: 1500 },
  { out: "editorial-gallery-2.jpg", file: "2026-02-03_DUSR3sBjYpw_1.jpg", w: 1200, h: 1200 },
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
