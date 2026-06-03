import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import sharp from "sharp";

const ASSET_ROOT = resolve(process.cwd(), "public", "assets");
const OUT_ROOT = resolve(process.cwd(), ".cloudinary", "masters");
const MANIFEST_PATH = resolve(process.cwd(), ".cloudinary", "optimized-manifest.json");
const MAX_EDGE = Number(process.env.CLOUDINARY_MASTER_MAX_EDGE ?? 2400);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

async function listImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return listImages(path);
      if (!entry.isFile()) return [];
      return IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase()) ? [path] : [];
    }),
  );
  return files.flat();
}

async function readPackMetadata() {
  const map = new Map();
  const manifests = (await listAssetManifests(ASSET_ROOT)).filter((file) =>
    file.endsWith("asset-manifest.json"),
  );

  for (const manifest of manifests) {
    const json = JSON.parse(await readFile(manifest, "utf8"));
    for (const asset of json.assets ?? []) {
      const normalized = String(asset.file ?? "").replaceAll("/", sep);
      const relativePath = normalized.startsWith(`assets${sep}`)
        ? normalized.slice(`assets${sep}`.length)
        : normalized;
      map.set(relativePath.replaceAll(sep, "/"), {
        pageSection: asset.pageSection ?? null,
        sourceType: asset.type ?? "instagram-source",
        productionReady: Boolean(asset.productionReady),
        notes: asset.notes ?? null,
        source: asset.source ?? null,
      });
    }
  }

  return map;
}

async function listAssetManifests(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return listAssetManifests(path);
      return entry.isFile() && entry.name === "asset-manifest.json" ? [path] : [];
    }),
  );
  return files.flat();
}

function pageContextFromPath(relativePath) {
  const parts = relativePath.split("/");
  return parts[0]?.startsWith("batch-") ? parts[0] : parts[0] ?? null;
}

function sectionContextFromPath(relativePath, packMetadata) {
  if (packMetadata?.pageSection) return packMetadata.pageSection;
  const parts = relativePath.split("/");
  return parts.length > 2 ? parts[1] : null;
}

function assetTypeFromPath(relativePath) {
  return relativePath.includes("-wide.") || relativePath.includes("hero") || relativePath.includes("banner")
    ? "support-image"
    : "product-editorial-image";
}

async function optimizeImage(sourcePath, packMetadataByPath) {
  const relativePath = relative(ASSET_ROOT, sourcePath).replaceAll(sep, "/");
  const outputPath = join(OUT_ROOT, relativePath);
  await mkdir(dirname(outputPath), { recursive: true });

  const image = sharp(sourcePath, { failOn: "none" }).rotate();
  const originalMetadata = await image.metadata();
  const pipeline = image.resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });

  const format = (originalMetadata.format ?? extname(sourcePath).slice(1)).toLowerCase();
  if (format === "png") {
    pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
  } else if (format === "webp") {
    pipeline.webp({ quality: 82 });
  } else if (format === "avif") {
    pipeline.avif({ quality: 50 });
  } else {
    pipeline.jpeg({ quality: 82, mozjpeg: true });
  }

  await pipeline.toFile(outputPath);

  const outputMetadata = await sharp(outputPath).metadata();
  const outputStat = await stat(outputPath);
  const sourceStat = await stat(sourcePath);
  const packMetadata = packMetadataByPath.get(relativePath);

  return {
    fileName: basename(sourcePath),
    filePath: `assets/${relativePath}`,
    originalPublicPath: `/assets/${relativePath}`,
    sourcePath: relative(process.cwd(), sourcePath).replaceAll(sep, "/"),
    masterPath: relative(process.cwd(), outputPath).replaceAll(sep, "/"),
    assetType: assetTypeFromPath(relativePath),
    sourceType: packMetadata?.sourceType ?? "instagram-source",
    pageContext: pageContextFromPath(relativePath),
    sectionContext: sectionContextFromPath(relativePath, packMetadata),
    productionReady: packMetadata?.productionReady ?? false,
    width: outputMetadata.width ?? null,
    height: outputMetadata.height ?? null,
    format: outputMetadata.format ?? format,
    byteSize: outputStat.size,
    originalByteSize: sourceStat.size,
    metadata: {
      maxEdge: MAX_EDGE,
      notes: packMetadata?.notes ?? null,
      originalSource: packMetadata?.source ?? null,
    },
  };
}

await mkdir(OUT_ROOT, { recursive: true });
const packMetadataByPath = await readPackMetadata();
const imagePaths = await listImages(ASSET_ROOT);
const assets = [];

for (const imagePath of imagePaths) {
  assets.push(await optimizeImage(imagePath, packMetadataByPath));
}

await mkdir(dirname(MANIFEST_PATH), { recursive: true });
await writeFile(
  MANIFEST_PATH,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), maxEdge: MAX_EDGE, assets }, null, 2)}\n`,
);

console.log(`Optimized ${assets.length} masters into ${relative(process.cwd(), OUT_ROOT)}.`);
console.log(`Wrote ${relative(process.cwd(), MANIFEST_PATH)}.`);
