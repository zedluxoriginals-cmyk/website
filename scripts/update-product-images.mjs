// Updates Supabase product_images + category image_url to the new curated
// /assets/products/ paths. Uses the service-role key (bypasses RLS) — run
// locally only. Reads the optimizer's _map.json.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SB_URL;
const serviceKey = process.env.SB_SERVICE;
if (!url || !serviceKey) {
  console.error("Missing SB_URL / SB_SERVICE");
  process.exit(1);
}
const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

const { productPaths, categoryPaths } = JSON.parse(
  readFileSync("C:/Dev/Zedluxeoriginals/web/public/assets/products/_map.json", "utf8"),
);

for (const [slug, paths] of Object.entries(productPaths)) {
  if (!paths.length) continue;
  const { data: product, error: pErr } = await sb
    .from("products")
    .select("id, title")
    .eq("slug", slug)
    .maybeSingle();
  if (pErr || !product) {
    console.error(`product ${slug}: not found`, pErr?.message ?? "");
    continue;
  }

  // Replace existing images for this product.
  await sb.from("product_images").delete().eq("product_id", product.id);

  const rows = paths.map((url, i) => ({
    product_id: product.id,
    url,
    alt_text: product.title,
    sort_order: i,
    is_primary: i === 0,
    source_type: "instagram-source",
    production_ready: true, // these are real client IG stills now
  }));
  const { error: iErr } = await sb.from("product_images").insert(rows);
  console.log(`${slug}: ${iErr ? "FAIL " + iErr.message : rows.length + " images set"}`);
}

for (const [slug, path] of Object.entries(categoryPaths)) {
  const { error } = await sb.from("categories").update({ image_url: path }).eq("slug", slug);
  console.log(`category ${slug}: ${error ? "FAIL " + error.message : "image updated"}`);
}

console.log("Done.");
