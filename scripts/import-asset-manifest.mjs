import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { loadEnv, requireEnv } from "./env.mjs";

loadEnv();

const UPLOAD_MANIFEST = resolve(process.cwd(), ".cloudinary", "cloudinary-upload-manifest.json");

const supabase = createClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { autoRefreshToken: false, persistSession: false } },
);

function cldDeliveryUrl(secureUrl) {
  const url = new URL(secureUrl);
  const segments = url.pathname.split("/");
  const uploadIndex = segments.indexOf("upload");
  if (uploadIndex !== -1) {
    segments.splice(uploadIndex + 1, 0, "f_auto,q_auto");
    url.pathname = segments.join("/");
  }
  return url.toString();
}

async function upsertAssetLibrary(asset) {
  const publicUrl = cldDeliveryUrl(asset.cloudinary.secureUrl);
  const row = {
    file_name: asset.fileName,
    file_path: asset.filePath,
    public_url: publicUrl,
    bucket: null,
    storage_provider: "cloudinary",
    asset_type: asset.assetType,
    source_type: asset.sourceType,
    page_context: asset.pageContext,
    section_context: asset.sectionContext,
    alt_text: null,
    width: asset.cloudinary.width ?? asset.width,
    height: asset.cloudinary.height ?? asset.height,
    format: asset.cloudinary.format ?? asset.format,
    byte_size: asset.cloudinary.bytes ?? asset.byteSize,
    production_ready: asset.productionReady,
    metadata: {
      ...asset.metadata,
      cloudinary_public_id: asset.cloudinary.publicId,
      cloudinary_asset_id: asset.cloudinary.assetId,
      cloudinary_version: asset.cloudinary.version,
      optimized_master_path: asset.masterPath,
      original_public_path: asset.originalPublicPath,
      original_byte_size: asset.originalByteSize,
    },
  };

  const { data: existing, error: selectError } = await supabase
    .from("asset_library")
    .select("id")
    .eq("file_path", asset.filePath)
    .limit(1)
    .maybeSingle();
  if (selectError) throw new Error(`asset_library select ${asset.filePath}: ${selectError.message}`);

  if (existing) {
    const { error } = await supabase.from("asset_library").update(row).eq("id", existing.id);
    if (error) throw new Error(`asset_library update ${asset.filePath}: ${error.message}`);
    return { id: existing.id, publicUrl, action: "updated" };
  }

  const { data: inserted, error } = await supabase
    .from("asset_library")
    .insert(row)
    .select("id")
    .single();
  if (error) throw new Error(`asset_library insert ${asset.filePath}: ${error.message}`);
  return { id: inserted.id, publicUrl, action: "inserted" };
}

async function updateProductImages(asset, publicUrl) {
  const candidatePaths = [
    asset.originalPublicPath,
    `/${asset.filePath}`,
    publicUrl,
    asset.cloudinary.secureUrl,
  ];

  const { data, error } = await supabase
    .from("product_images")
    .update({
      url: publicUrl,
      source_type: asset.sourceType,
      production_ready: asset.productionReady,
    })
    .in("url", candidatePaths)
    .select("id");

  if (error) throw new Error(`product_images update ${asset.filePath}: ${error.message}`);
  return data?.length ?? 0;
}

const manifest = JSON.parse(await readFile(UPLOAD_MANIFEST, "utf8"));
let inserted = 0;
let updated = 0;
let linkedProductImages = 0;

for (const asset of manifest.assets) {
  const result = await upsertAssetLibrary(asset);
  if (result.action === "inserted") inserted += 1;
  if (result.action === "updated") updated += 1;
  linkedProductImages += await updateProductImages(asset, result.publicUrl);
}

console.log(`asset_library inserted=${inserted} updated=${updated}`);
console.log(`product_images updated=${linkedProductImages}`);
