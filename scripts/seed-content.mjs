// Enriches the live catalogue so the site feels alive: full product copy +
// material/care/fit on the 12 real products, category descriptions, and ~7 new
// products (reusing real photos) to fill out shop/collections. Everything here
// is editable later from the admin panel. Service-role (bypasses RLS) — run local.
import { createClient } from "@supabase/supabase-js";

const url = process.env.SB_URL;
const serviceKey = process.env.SB_SERVICE;
if (!url || !serviceKey) { console.error("Missing SB_URL / SB_SERVICE"); process.exit(1); }
const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

const CARE_KNIT = "Machine wash cold inside out. Wash with like colours. Do not bleach. Tumble dry low. Cool iron if needed.";
const CARE_TEE = "Machine wash cold with like colours. Do not bleach. Hang or tumble dry low. Warm iron on reverse.";
const CARE_OUTER = "Spot clean or gentle cold wash. Do not wring. Reshape and hang to dry. Steam to refresh.";
const CARE_HAT = "Spot clean with a damp cloth. Air dry. Do not machine wash. Reshape while damp.";
const CARE_WOVEN = "Cold gentle machine wash, inside out. Do not bleach. Line dry in shade. Warm iron on reverse.";

// ---------- 1. ENRICH the 12 real products ----------
const enrich = {
  "classic-logo-tee": {
    description:
      "The tee that started it all. A heavyweight cotton silhouette carrying the ZEDLUXE signature mark across the chest — clean, confident, made to be worn on repeat. Boxy enough to layer, refined enough to stand alone.",
    material: "240gsm 100% combed cotton",
    care_instructions: CARE_TEE,
    fit_notes: "Relaxed fit, true to size. Size down for a closer cut.",
  },
  "zedluxe-essential-cap": {
    description:
      "A structured six-panel cap with a tonal embroidered logo and an adjustable strap. The finishing piece that pulls a look together — day to night, on or off the field.",
    material: "Cotton twill with brushed lining",
    care_instructions: CARE_HAT,
    fit_notes: "One size, adjustable strap back.",
  },
  "zedluxe-mesh-jersey": {
    description:
      "Sport heritage, ZEDLUXE attitude. A breathable mesh jersey carrying a bold front numeral and clean side detailing. Built loose for movement, styled for the street.",
    material: "Lightweight polyester mesh",
    care_instructions: CARE_KNIT,
    fit_notes: "Oversized fit. Size down for a standard cut.",
  },
  "signature-tracksuit": {
    description:
      "The flagship two-piece. A brushed-back tracksuit in a soft, premium hand-feel with embroidered branding and tapered legs. Engineered to look as sharp standing still as it moves — the cornerstone of the ZEDLUXE wardrobe.",
    material: "320gsm cotton-blend fleece",
    care_instructions: CARE_KNIT,
    fit_notes: "Relaxed top, tapered leg. True to size.",
  },
  "minimal-logo-tee": {
    description:
      "Less, done louder. A pared-back tee with a tonal chest mark and a perfected boxy cut. The everyday essential that quietly elevates everything you put it with.",
    material: "220gsm 100% cotton",
    care_instructions: CARE_TEE,
    fit_notes: "Regular boxy fit, true to size.",
  },
  "zedluxe-logo-hoodie": {
    description:
      "Weight you can feel. A heavyweight hoodie with a double-lined hood, ribbed cuffs and a raised ZEDLUXE logo. The piece you reach for first when the temperature drops and the fit still has to land.",
    material: "350gsm brushed cotton-blend fleece",
    care_instructions: CARE_KNIT,
    fit_notes: "Oversized fit. Size down for regular.",
  },
  "zedluxe-track-pants": {
    description:
      "The other half of the look, strong enough to stand alone. Tapered track pants with a comfort waistband, side branding and a clean drop. Designed to move with you and frame the right shoes.",
    material: "320gsm cotton-blend fleece",
    care_instructions: CARE_KNIT,
    fit_notes: "Tapered fit with elastic waist. True to size.",
  },
  "the-lost-tee-blue": {
    description:
      "A statement, worn. The 'ZEDLUXE or be lost' graphic tee in washed blue — a manifesto on cotton. For the ones who already know which side they're on.",
    material: "240gsm 100% combed cotton",
    care_instructions: CARE_TEE,
    fit_notes: "Relaxed fit, true to size.",
  },
  "signature-red-set": {
    description:
      "Unmissable by design. The signature set in deep red with embroidered branding across both pieces — a coordinated statement built to own the room. A limited run.",
    material: "300gsm cotton-blend",
    care_instructions: CARE_KNIT,
    fit_notes: "Relaxed co-ord fit. True to size; size up to drape.",
  },
  "patterned-top": {
    description:
      "Texture and attitude. A patterned top carrying the ZEDLUXE monogram motif with a considered drape and finish. A piece that does the talking before you do.",
    material: "Woven cotton blend",
    care_instructions: CARE_WOVEN,
    fit_notes: "Regular fit, true to size.",
  },
  "zedluxe-bucket-hat": {
    description:
      "The easy finisher. A structured bucket hat with embroidered branding and a clean brim — the accessory that signals the whole look is intentional.",
    material: "Cotton twill",
    care_instructions: CARE_HAT,
    fit_notes: "One size fits most.",
  },
  // floral-satin-jacket already enriched + repurposed to Monogram Set; refresh care.
  "floral-satin-jacket": {
    care_instructions: CARE_WOVEN,
  },
};

for (const [slug, patch] of Object.entries(enrich)) {
  const { error } = await sb.from("products").update(patch).eq("slug", slug);
  console.log(`enrich ${slug}: ${error ? "FAIL " + error.message : "ok"}`);
}

// ---------- 2. CATEGORY descriptions ----------
const catCopy = {
  tees: "Heavyweight cotton, perfected cuts and the ZEDLUXE mark. The foundation of the wardrobe — essentials engineered to be worn on repeat.",
  outerwear: "Layers with intent. Statement jackets and pieces built to finish a look and hold their shape season after season.",
  sets: "Coordinated, considered, unmissable. Two-piece sets designed to land as one statement — wear them together or break them apart.",
  accessories: "The finishing touches. Caps, bucket hats and the details that signal the whole look was intentional.",
  tops: "Texture, pattern and attitude above the waist. Tops that do the talking before you do.",
  bottoms: "Tapered, clean and built to move. The other half of the look — strong enough to stand on its own.",
};
for (const [slug, description] of Object.entries(catCopy)) {
  const { error } = await sb.from("categories").update({ description }).eq("slug", slug);
  console.log(`category ${slug}: ${error ? "FAIL " + error.message : "ok"}`);
}

// ---------- 3. NEW products to fill the catalogue ----------
// Reuse existing real /assets/products images. Clearly editable in admin later.
const SIZES_TEE = ["XS", "S", "M", "L", "XL", "XXL"];
const SIZES_STD = ["S", "M", "L", "XL"];
const HAT = ["OS"];

function variantsFor(prodTitle, basePrice, colors, sizes) {
  const rows = [];
  for (const c of colors) {
    for (const s of sizes) {
      rows.push({
        sku: `${prodTitle.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 12)}-${c.name.slice(0, 3).toUpperCase()}-${s}`,
        title: `${c.name} / ${s}`,
        color_name: c.name,
        color_hex: c.hex,
        size: s,
        price: basePrice,
        stock_quantity: 20,
        low_stock_threshold: 3,
        is_active: true,
      });
    }
  }
  return rows;
}

// imageSlugs reference already-uploaded product image files (real photos).
const newProducts = [
  {
    slug: "classic-logo-tee-black",
    title: "Classic Logo Tee — Onyx",
    base_price: 45000, badge: "NEW", is_featured: true, category: "tees",
    description: "The signature tee in deep onyx black. Same heavyweight hand-feel, same chest mark — a darker mood for the everyday icon.",
    material: "240gsm 100% combed cotton", care_instructions: CARE_TEE,
    fit_notes: "Relaxed fit, true to size.",
    images: ["minimal-logo-tee-1.jpg"],
    colors: [{ name: "Black", hex: "#111111" }], sizes: SIZES_TEE,
  },
  {
    slug: "zedluxe-cap-red",
    title: "Essential Cap — Crimson",
    base_price: 35000, badge: null, is_featured: false, category: "accessories",
    description: "The essential six-panel cap in bold crimson with a tonal embroidered mark. A pop of colour to finish any fit.",
    material: "Cotton twill with brushed lining", care_instructions: CARE_HAT,
    fit_notes: "One size, adjustable strap.",
    images: ["zedluxe-essential-cap-2.jpg", "zedluxe-essential-cap-1.jpg"],
    colors: [{ name: "Crimson", hex: "#b1231f" }], sizes: HAT,
  },
  {
    slug: "monogram-set-noir",
    title: "Monogram Set — Noir",
    base_price: 125000, badge: "LIMITED", is_featured: true, category: "sets",
    description: "The monogram statement set rendered in full noir. A coordinated two-piece built to command attention from every angle — a limited run.",
    material: "Premium woven blend", care_instructions: CARE_WOVEN,
    fit_notes: "Relaxed co-ord fit. Size up to drape.",
    images: ["floral-satin-jacket-1.jpg", "floral-satin-jacket-2.jpg"],
    colors: [{ name: "Noir", hex: "#1a1a1a" }], sizes: SIZES_STD,
  },
  {
    slug: "signature-hoodie-stone",
    title: "Signature Hoodie — Stone",
    base_price: 95000, badge: null, is_featured: false, category: "tops",
    description: "The heavyweight signature hoodie in a soft stone neutral. Double-lined hood, raised logo, premium weight — the cold-weather cornerstone in an easy-to-style tone.",
    material: "350gsm brushed cotton-blend fleece", care_instructions: CARE_KNIT,
    fit_notes: "Oversized fit. Size down for regular.",
    images: ["zedluxe-logo-hoodie-2.jpg", "zedluxe-logo-hoodie-1.jpg"],
    colors: [{ name: "Stone", hex: "#b8aD9a" }], sizes: SIZES_STD,
  },
  {
    slug: "track-pants-black",
    title: "Track Pants — Onyx",
    base_price: 65000, badge: null, is_featured: false, category: "bottoms",
    description: "The tapered track pant in deep onyx. Comfort waistband, clean drop, side branding — the perfect base for a head-to-toe ZEDLUXE fit.",
    material: "320gsm cotton-blend fleece", care_instructions: CARE_KNIT,
    fit_notes: "Tapered fit, elastic waist. True to size.",
    images: ["zedluxe-track-pants-1.jpg", "zedluxe-track-pants-2.jpg"],
    colors: [{ name: "Onyx", hex: "#141414" }], sizes: SIZES_STD,
  },
  {
    slug: "lost-tee-black",
    title: "The Lost Tee — Black",
    base_price: 48000, badge: "NEW", is_featured: false, category: "tees",
    description: "The 'ZEDLUXE or be lost' manifesto tee in classic black. A statement that needs no introduction — for the ones who already know.",
    material: "240gsm 100% combed cotton", care_instructions: CARE_TEE,
    fit_notes: "Relaxed fit, true to size.",
    images: ["the-lost-tee-blue-1.jpg", "the-lost-tee-blue-2.jpg"],
    colors: [{ name: "Black", hex: "#111111" }], sizes: SIZES_TEE,
  },
  {
    slug: "mesh-jersey-black",
    title: "Mesh Jersey — Black",
    base_price: 68000, badge: null, is_featured: false, category: "tops",
    description: "Sport heritage in stealth black. The breathable mesh jersey with bold front numeral and clean side detailing — built loose, styled for the street.",
    material: "Lightweight polyester mesh", care_instructions: CARE_KNIT,
    fit_notes: "Oversized fit. Size down for standard.",
    images: ["zedluxe-mesh-jersey-2.jpg", "zedluxe-mesh-jersey-1.jpg"],
    colors: [{ name: "Black", hex: "#161616" }], sizes: SIZES_STD,
  },
];

const catIds = Object.fromEntries(
  (await sb.from("categories").select("id,slug")).data.map((c) => [c.slug, c.id]),
);

for (const p of newProducts) {
  // skip if already seeded (idempotent)
  const { data: existing } = await sb.from("products").select("id").eq("slug", p.slug).maybeSingle();
  if (existing) { console.log(`new ${p.slug}: already exists, skip`); continue; }

  const { data: prod, error: pErr } = await sb.from("products").insert({
    slug: p.slug, title: p.title, base_price: p.base_price, badge: p.badge,
    is_featured: p.is_featured, status: "active", currency: "NGN",
    description: p.description, material: p.material,
    care_instructions: p.care_instructions, fit_notes: p.fit_notes,
    published_at: new Date().toISOString(),
  }).select("id").single();
  if (pErr) { console.log(`new ${p.slug}: FAIL ${pErr.message}`); continue; }

  await sb.from("product_categories").insert({ product_id: prod.id, category_id: catIds[p.category], sort_order: 0 });

  const imgRows = p.images.map((f, i) => ({
    product_id: prod.id, url: `/assets/products/${f}`, alt_text: p.title,
    sort_order: i, is_primary: i === 0, source_type: "instagram-source", production_ready: true,
  }));
  await sb.from("product_images").insert(imgRows);

  const vRows = variantsFor(p.title, p.base_price, p.colors, p.sizes).map((v) => ({ ...v, product_id: prod.id }));
  const { error: vErr } = await sb.from("product_variants").insert(vRows);
  console.log(`new ${p.slug}: created (${imgRows.length} img, ${vRows.length} variants)${vErr ? " VAR FAIL " + vErr.message : ""}`);
}

console.log("\nSeed content done.");
