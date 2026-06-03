// Optimizes the curated IG photos → web-sized JPEGs in public/assets/products/
// and emits a JSON of slug → [public paths] for the DB update step.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { productImageMap, categoryImageMap } from "./image-map.mjs";

const SRC = "C:/Dev/Zedluxeoriginals/web/_source-images/ig-downloads-gdl";
const OUT = "C:/Dev/Zedluxeoriginals/web/public/assets/products";
mkdirSync(OUT, { recursive: true });

// Product card aspect is ~1/1.18 (portrait). Keep generous height; cap width.
const WIDTH = 1200;
const HEIGHT = Math.round(WIDTH * 1.18); // 1416

async function optimize(srcFile, outName) {
  const srcPath = path.join(SRC, srcFile);
  if (!existsSync(srcPath)) {
    console.error("MISSING SOURCE:", srcFile);
    return false;
  }
  await sharp(srcPath)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, outName));
  return true;
}

const productPaths = {};
for (const [slug, files] of Object.entries(productImageMap)) {
  const paths = [];
  for (let i = 0; i < files.length; i++) {
    const outName = `${slug}-${i + 1}.jpg`;
    const ok = await optimize(files[i], outName);
    if (ok) paths.push(`/assets/products/${outName}`);
  }
  productPaths[slug] = paths;
  console.log(`${slug}: ${paths.length} image(s)`);
}

// Category tiles — square-ish crop.
const categoryPaths = {};
for (const [slug, file] of Object.entries(categoryImageMap)) {
  const srcPath = path.join(SRC, file);
  if (!existsSync(srcPath)) {
    console.error("MISSING CATEGORY SRC:", file);
    continue;
  }
  const outName = `category-${slug}.jpg`;
  await sharp(srcPath)
    .resize(800, 900, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, outName));
  categoryPaths[slug] = `/assets/products/${outName}`;
  console.log(`category ${slug}: ok`);
}

writeFileSync(
  path.join(OUT, "_map.json"),
  JSON.stringify({ productPaths, categoryPaths }, null, 2),
);
console.log("Wrote _map.json");
