// Optimizes the 16 previously-unused HD source posts into /assets/products/
// as distinct new-product imagery. Same HD guard + attention crop as batch 1.
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "_source-images/ig-downloads-gdl";
const OUT = "public/assets/products";
mkdirSync(OUT, { recursive: true });
const MIN_SRC_W = 1000;
const WIDTH = 1200;
const HEIGHT = Math.round(WIDTH * 1.18); // 1416, matches batch 1

// outName(no ext) → source file. Names chosen to match the products in seed-batch2.
const map = {
  "skate-white-tee": "2026-06-01_DZCzaY6NGpi_1.webp",
  "dot-camp-shirt": "2026-05-18_DYfFhc8Nd70_1.webp",
  "ringer-logo-tee": "2026-05-15_DYXY44vNhaZ_1.webp",
  "orange-logo-sweater": "2026-03-02_DVX0h7-DXYo_1.jpg",
  "red-black-tracksuit": "2026-02-05_DUXWmPKDJTy_1.jpg",
  "noir-zip-jacket": "2026-01-25_DT7_anUDfah_1.jpg",
  "ribbed-crop-top": "2026-01-22_DT0srMbjWd__1.jpg",
  "floral-bomber": "2025-12-24_DSp5zgeDV9L_1.jpg",
  "black-tee-red-short-set": "2025-12-02_DRxFl0bjVWA_1.jpg",
  "sage-logo-tee": "2025-12-01_DRuq9ZbDZWJ_1.jpg",
  "royal-blue-tracksuit": "2025-11-10_DQ4YlhdjeHj_1.jpg",
  "tan-utility-look": "2025-05-01_DJHLLj3twb7_1.jpg",
  "cream-oversized-tee": "2025-04-27_DI9LTumNZTq_1.jpg",
  "blue-logo-tee-2": "2025-03-24_DHmAJIJtfXZ_1.jpg",
  "bucket-duo-tee": "2025-02-07_DFyAv3XNTR4_1.jpg",
  "blue-zed-tee-w": "2025-02-07_DFx_hV5NNJU_1.jpg",
};

for (const [name, file] of Object.entries(map)) {
  const srcPath = path.join(SRC, file);
  if (!existsSync(srcPath)) { console.error("MISSING:", file); continue; }
  const meta = await sharp(srcPath).metadata();
  if ((meta.width ?? 0) < MIN_SRC_W) { console.error(`SKIP low-res ${meta.width}:`, file); continue; }
  await sharp(srcPath)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, `${name}-1.jpg`));
  console.log(`${name}-1.jpg  ←  ${file} (${meta.width}×${meta.height})`);
}
console.log("Done.");
