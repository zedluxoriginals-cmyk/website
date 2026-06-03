import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { loadEnv, requireEnv } from "./env.mjs";

loadEnv();

const OPTIMIZED_MANIFEST = resolve(process.cwd(), ".cloudinary", "optimized-manifest.json");
const UPLOAD_MANIFEST = resolve(process.cwd(), ".cloudinary", "cloudinary-upload-manifest.json");
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "zedluxe";

cloudinary.config({
  cloud_name: requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
  api_key: requireEnv("CLOUDINARY_API_KEY"),
  api_secret: requireEnv("CLOUDINARY_API_SECRET"),
  secure: true,
});

function publicIdFor(asset) {
  return `${CLOUDINARY_FOLDER}/${asset.filePath.replace(/^assets\//, "").replace(/\.[^.]+$/, "")}`;
}

const manifest = JSON.parse(await readFile(OPTIMIZED_MANIFEST, "utf8"));
const uploaded = [];

for (const asset of manifest.assets) {
  const publicId = publicIdFor(asset);
  const result = await cloudinary.uploader.upload(resolve(process.cwd(), asset.masterPath), {
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
    tags: ["zedluxe", asset.sourceType, asset.productionReady ? "production-ready" : "placeholder"],
    context: {
      file_path: asset.filePath,
      original_public_path: asset.originalPublicPath,
      page_context: asset.pageContext ?? "",
      section_context: asset.sectionContext ?? "",
    },
  });

  uploaded.push({
    ...asset,
    cloudinary: {
      publicId: result.public_id,
      assetId: result.asset_id,
      version: result.version,
      secureUrl: result.secure_url,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      format: result.format,
    },
  });

  console.log(`Uploaded ${asset.filePath} -> ${result.public_id}`);
}

await mkdir(dirname(UPLOAD_MANIFEST), { recursive: true });
await writeFile(
  UPLOAD_MANIFEST,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), assets: uploaded }, null, 2)}\n`,
);

console.log(`Uploaded ${uploaded.length} assets.`);
console.log(`Wrote ${UPLOAD_MANIFEST}.`);
