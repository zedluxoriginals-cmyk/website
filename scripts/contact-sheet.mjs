// Builds contact-sheet montages from the IG download set so the whole library
// can be eyeballed quickly. Tiles thumbnails into grids; writes a JSON index
// mapping each tile's cell number → source filename.
import { readdirSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "C:/Dev/Zedluxeoriginals/web/_source-images/ig-downloads-gdl";
const OUT = "C:/tmp/zed-contact";
mkdirSync(OUT, { recursive: true });

const COLS = 6;
const ROWS = 5;
const CELL = 200; // px thumb
const PER = COLS * ROWS;

// Use the FIRST slide of each post (carousel pos _1) to keep one tile/post,
// newest first (most relevant), fall back to any image.
const all = readdirSync(SRC).filter((f) => /\.(jpg|webp)$/i.test(f));
const firstSlides = all
  .filter((f) => /_1\.(jpg|webp)$/i.test(f) || /^\d{16,}_/.test(f))
  .sort()
  .reverse();
const list = firstSlides.length ? firstSlides : all.sort().reverse();

const index = {};
let sheet = 0;

for (let i = 0; i < list.length; i += PER) {
  const batch = list.slice(i, i + PER);
  const tiles = [];
  for (let j = 0; j < batch.length; j++) {
    const cell = j + 1;
    const globalNo = i + j + 1;
    index[`s${sheet}_c${cell}`] = batch[j];
    index[`#${globalNo}`] = batch[j];
    const col = j % COLS;
    const row = Math.floor(j / COLS);
    try {
      const buf = await sharp(path.join(SRC, batch[j]))
        .resize(CELL, CELL, { fit: "cover" })
        .extend({ bottom: 22, background: "#000" })
        .composite([
          {
            input: Buffer.from(
              `<svg width="${CELL}" height="${CELL + 22}"><text x="4" y="${CELL + 16}" fill="#fff" font-size="14" font-family="monospace">#${globalNo}</text></svg>`,
            ),
            top: 0,
            left: 0,
          },
        ])
        .toBuffer();
      tiles.push({ input: buf, top: row * (CELL + 22), left: col * CELL });
    } catch (e) {
      console.error("skip", batch[j], e.message);
    }
  }
  const W = COLS * CELL;
  const H = ROWS * (CELL + 22);
  await sharp({ create: { width: W, height: H, channels: 3, background: "#111" } })
    .composite(tiles)
    .jpeg({ quality: 70 })
    .toFile(path.join(OUT, `sheet-${sheet}.jpg`));
  console.log(`sheet-${sheet}.jpg (${batch.length} tiles, #${i + 1}–#${i + batch.length})`);
  sheet++;
}

writeFileSync(path.join(OUT, "index.json"), JSON.stringify(index, null, 0));
console.log(`Done: ${sheet} sheets, ${list.length} posts indexed → ${OUT}`);
