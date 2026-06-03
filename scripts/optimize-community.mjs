// Optimizes HD lifestyle stills for the homepage @ZEDLUXE community strip.
// ENFORCES an HD guard: any source under MIN_SRC_W is skipped (this strip was
// previously full of low-res screenshot crops). Landscape 4:3 cells.
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "_source-images/ig-downloads-gdl";
const OUT = "public/assets/ig";
mkdirSync(OUT, { recursive: true });

const MIN_SRC_W = 1100; // reject anything that would upscale / look soft
const W = 900;
const H = Math.round((W * 3) / 4); // 4:3 → 900×675

// Curated HD lifestyle picks (full looks / community vibe, all ≥1440w sources).
const picks = [
  { file: "2026-02-03_DUSSC7aDVnS_1.jpg", alt: "ZEDLUXE community lifestyle" },
  { file: "2025-11-24_DRcTbICjDid_1.jpg", alt: "Model in ZEDLUXE on location" },
  { file: "2025-10-16_DP38gQdDJbZ_1.jpg", alt: "ZEDLUXE street style" },
  { file: "2025-07-29_DMsjJ0xtE-__1.jpg", alt: "ZEDLUXE summer look" },
  { file: "2025-02-11_DF7xXZEoOzz_1.jpg", alt: "ZEDLUXE editorial lifestyle" },
  { file: "2025-02-09_DF2XkTYNH6e_1.jpg", alt: "Model wearing ZEDLUXE ORIGINALS" },
];

const out = [];
for (const p of picks) {
  const srcPath = path.join(SRC, p.file);
  if (!existsSync(srcPath)) {
    console.error("MISSING SOURCE:", p.file);
    continue;
  }
  const meta = await sharp(srcPath).metadata();
  if ((meta.width ?? 0) < MIN_SRC_W) {
    console.error(`SKIP (low-res ${meta.width}px < ${MIN_SRC_W}):`, p.file);
    continue;
  }
  const outName = `community-${out.length + 1}.jpg`;
  await sharp(srcPath)
    .resize(W, H, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, outName));
  out.push({ src: `/assets/ig/${outName}`, alt: p.alt });
  console.log(`${outName}  ←  ${p.file} (${meta.width}×${meta.height})`);
}

writeFileSync(path.join(OUT, "_community.json"), JSON.stringify(out, null, 2));
console.log(`\nWrote ${out.length} community images + _community.json`);
