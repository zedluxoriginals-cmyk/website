// Bulk catalogue seed: 13 DISTINCT new products from real unused photos, then
// colour-variant padding to ~55 total. Varied realistic price/stock/badges.
// Idempotent (skips slugs that exist). Service-role. Editable later in admin.
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.SB_URL, process.env.SB_SERVICE, { auth: { persistSession: false } });

const SIZES_TEE = ["XS", "S", "M", "L", "XL", "XXL"];
const SIZES_STD = ["S", "M", "L", "XL"];
const HAT = ["OS"];

const CARE = {
  tee: "Machine wash cold with like colours. Do not bleach. Hang or tumble dry low. Warm iron on reverse.",
  knit: "Machine wash cold inside out. Do not bleach. Tumble dry low. Cool iron if needed.",
  outer: "Spot clean or gentle cold wash. Reshape and hang to dry. Steam to refresh.",
  woven: "Cold gentle machine wash, inside out. Line dry in shade. Warm iron on reverse.",
  hat: "Spot clean with a damp cloth. Air dry. Do not machine wash.",
};

const catIds = Object.fromEntries(
  (await sb.from("categories").select("id,slug")).data.map((c) => [c.slug, c.id]),
);

// Pseudo-random but deterministic stock so re-runs are stable per slug.
function hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
function stockFor(slug, i) {
  const r = hash(slug + i) % 100;
  if (r < 8) return 0;        // ~8% sold out
  if (r < 25) return (hash(slug + i) % 3) + 1; // ~17% low stock 1-3
  return (hash(slug + i) % 30) + 6;            // healthy 6-35
}

async function createProduct(p) {
  const { data: existing } = await sb.from("products").select("id").eq("slug", p.slug).maybeSingle();
  if (existing) { console.log(`${p.slug}: exists, skip`); return; }

  // guard: image file must exist
  for (const f of p.images) {
    if (!existsSync("public/assets/products/" + f)) { console.log(`${p.slug}: MISSING IMG ${f}, skip`); return; }
  }

  const { data: prod, error } = await sb.from("products").insert({
    slug: p.slug, title: p.title, base_price: p.base_price, badge: p.badge ?? null,
    is_featured: !!p.featured, status: "active", currency: "NGN",
    description: p.description, material: p.material,
    care_instructions: CARE[p.care], fit_notes: p.fit,
    published_at: new Date().toISOString(),
  }).select("id").single();
  if (error) { console.log(`${p.slug}: FAIL ${error.message}`); return; }

  await sb.from("product_categories").insert({ product_id: prod.id, category_id: catIds[p.category], sort_order: 0 });
  await sb.from("product_images").insert(p.images.map((f, i) => ({
    product_id: prod.id, url: `/assets/products/${f}`, alt_text: p.title,
    sort_order: i, is_primary: i === 0, source_type: "instagram-source", production_ready: true,
  })));

  const vRows = [];
  for (const c of p.colors) for (const s of p.sizes) {
    vRows.push({
      product_id: prod.id,
      sku: `${p.slug.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 12)}-${c.name.slice(0, 3).toUpperCase()}-${s}`,
      title: `${c.name} / ${s}`, color_name: c.name, color_hex: c.hex, size: s,
      price: p.base_price, stock_quantity: stockFor(p.slug, c.name + s),
      low_stock_threshold: 3, is_active: true,
    });
  }
  const { error: vErr } = await sb.from("product_variants").insert(vRows);
  console.log(`${p.slug}: created (${p.images.length} img, ${vRows.length} variants)${vErr ? " VAR FAIL " + vErr.message : ""}`);
}

const WHITE = { name: "White", hex: "#f4f4f4" };
const BLACK = { name: "Black", hex: "#141414" };
const BLUE = { name: "Blue", hex: "#2a4a8c" };
const RED = { name: "Red", hex: "#b1231f" };
const SAGE = { name: "Sage", hex: "#9ca685" };
const TAN = { name: "Tan", hex: "#c2a878" };
const ORANGE = { name: "Orange", hex: "#d4622a" };

// ---- 13 DISTINCT real-photo products ----
const distinct = [
  { slug: "skate-essential-tee", title: "Skate Essential Tee", base_price: 44000, badge: "NEW", featured: true, category: "tees", care: "tee", sizes: SIZES_TEE, colors: [WHITE, BLACK], images: ["skate-white-tee-1.jpg"], material: "240gsm 100% combed cotton", fit: "Relaxed fit, true to size.", description: "Built for motion. A clean white ZEDLUXE tee with a relaxed drape that moves with you — the everyday essential, street-tested." },
  { slug: "monogram-camp-shirt", title: "Monogram Camp Shirt", base_price: 62000, badge: null, featured: false, category: "tops", care: "woven", sizes: SIZES_STD, colors: [{ name: "Ivory", hex: "#e8e2d4" }], images: ["dot-camp-shirt-1.jpg"], material: "Woven cotton blend", fit: "Regular camp-collar fit.", description: "An all-over patterned short-sleeve camp shirt with an open collar and easy drape. Vacation-ready, ZEDLUXE-finished." },
  { slug: "ringer-logo-tee", title: "Ringer Logo Tee", base_price: 46000, badge: "NEW", featured: true, category: "tees", care: "tee", sizes: SIZES_TEE, colors: [{ name: "White / Black", hex: "#222222" }], images: ["ringer-logo-tee-1.jpg"], material: "240gsm combed cotton", fit: "Relaxed fit, true to size.", description: "Contrast-sleeve ringer tee with the ZEDLUXE crest front and centre. Retro silhouette, modern weight." },
  { slug: "orange-logo-sweater", title: "Colour-Block Logo Sweater", base_price: 88000, badge: null, featured: false, category: "tops", care: "knit", sizes: SIZES_STD, colors: [{ name: "Orange / Black", hex: "#d4622a" }], images: ["orange-logo-sweater-1.jpg"], material: "320gsm cotton-blend fleece", fit: "Regular fit, true to size.", description: "A colour-block crew in orange and black with embroidered branding. Warmth with a statement edge." },
  { slug: "red-black-tracksuit", title: "Two-Tone Tracksuit — Red", base_price: 118000, badge: "LIMITED", featured: true, category: "sets", care: "knit", sizes: SIZES_STD, colors: [{ name: "Red / Black", hex: "#9e1f1b" }], images: ["red-black-tracksuit-1.jpg"], material: "320gsm cotton-blend fleece", fit: "Relaxed top, tapered leg.", description: "A two-tone tracksuit in red and black with embroidered branding throughout. The full statement, head to toe." },
  { slug: "noir-zip-jacket", title: "Noir Zip Jacket", base_price: 98000, badge: null, featured: false, category: "outerwear", care: "outer", sizes: SIZES_STD, colors: [BLACK], images: ["noir-zip-jacket-1.jpg"], material: "Woven shell with brushed lining", fit: "Regular fit, layer-friendly.", description: "A clean black zip jacket with subtle branding — the versatile layer that finishes any fit from day to night." },
  { slug: "floral-satin-bomber", title: "Floral Satin Bomber", base_price: 135000, badge: "LIMITED", featured: true, category: "outerwear", care: "woven", sizes: SIZES_STD, colors: [{ name: "Black Floral", hex: "#2a1a1a" }], images: ["floral-bomber-1.jpg"], material: "Satin-finish woven blend", fit: "Relaxed bomber fit.", description: "The real statement outerwear: a satin bomber with an embroidered floral motif and bold ZEDLUXE wordmark across the back. A limited drop built to stand out." },
  { slug: "sage-logo-tee", title: "Sage Logo Tee", base_price: 44000, badge: null, featured: false, category: "tees", care: "tee", sizes: SIZES_TEE, colors: [SAGE], images: ["sage-logo-tee-1.jpg"], material: "240gsm combed cotton", fit: "Relaxed fit, true to size.", description: "The signature tee in a muted sage tone. Quiet colour, loud quality — an easy add to any rotation." },
  { slug: "royal-blue-tracksuit", title: "Signature Tracksuit — Royal", base_price: 120000, badge: null, featured: false, category: "sets", care: "knit", sizes: SIZES_STD, colors: [{ name: "Royal Blue", hex: "#2a4a8c" }], images: ["royal-blue-tracksuit-1.jpg"], material: "320gsm cotton-blend fleece", fit: "Relaxed top, tapered leg.", description: "The signature tracksuit in deep royal blue with embroidered branding. Bold colour, premium hand-feel." },
  { slug: "utility-cargo-look", title: "Tan Utility Cargo Set", base_price: 105000, badge: null, featured: false, category: "sets", care: "woven", sizes: SIZES_STD, colors: [TAN], images: ["tan-utility-look-1.jpg"], material: "Cotton-twill utility weave", fit: "Relaxed utility fit.", description: "A tan utility-inspired co-ord with functional detailing and a clean drape. Street utility, elevated." },
  { slug: "blue-logo-tee-vol2", title: "Logo Tee Vol. 2 — Blue", base_price: 46000, badge: "NEW", featured: false, category: "tees", care: "tee", sizes: SIZES_TEE, colors: [BLUE], images: ["blue-logo-tee-2-1.jpg"], material: "240gsm combed cotton", fit: "Relaxed fit, true to size.", description: "The next chapter of the logo tee in a rich blue. Same signature mark, fresh colourway." },
  { slug: "bucket-duo-tee", title: "Heavyweight Crest Tee", base_price: 45000, badge: null, featured: false, category: "tees", care: "tee", sizes: SIZES_TEE, colors: [WHITE], images: ["bucket-duo-tee-1.jpg"], material: "260gsm heavyweight cotton", fit: "Boxy oversized fit.", description: "A heavyweight crest tee with a boxy oversized cut. Substance you can feel, branding you can trust." },
  { slug: "blue-zed-tee", title: "ZEDLUXE Wordmark Tee — Blue", base_price: 45000, badge: null, featured: false, category: "tees", care: "tee", sizes: SIZES_TEE, colors: [BLUE], images: ["blue-zed-tee-w-1.jpg"], material: "240gsm combed cotton", fit: "Relaxed unisex fit.", description: "The ZEDLUXE wordmark front and centre on a clean blue tee. A unisex everyday staple." },
];

for (const p of distinct) await createProduct(p);

// ---- Colour-variant padding to fill the catalogue (reuses real photos) ----
// Each entry spins an existing real photo into a new colourway/edition product.
const pad = [
  // tees
  { slug: "classic-logo-tee-sand", title: "Classic Logo Tee — Sand", base_price: 45000, category: "tees", care: "tee", sizes: SIZES_TEE, colors: [{ name: "Sand", hex: "#d8c7a8" }], images: ["classic-logo-tee-1.jpg"], material: "240gsm combed cotton", fit: "Relaxed fit.", description: "The signature tee in a warm sand neutral — the easiest colour to build a fit around." },
  { slug: "classic-logo-tee-olive", title: "Classic Logo Tee — Olive", base_price: 45000, badge: "NEW", category: "tees", care: "tee", sizes: SIZES_TEE, colors: [{ name: "Olive", hex: "#6b6f4a" }], images: ["classic-logo-tee-2.jpg"], material: "240gsm combed cotton", fit: "Relaxed fit.", description: "An earthy olive take on the tee that started it all." },
  { slug: "minimal-tee-white", title: "Minimal Logo Tee — White", base_price: 42000, category: "tees", care: "tee", sizes: SIZES_TEE, colors: [WHITE], images: ["minimal-logo-tee-1.jpg"], material: "220gsm cotton", fit: "Regular boxy fit.", description: "The pared-back essential in clean white. Tonal mark, perfected cut." },
  { slug: "lost-tee-sand", title: "The Lost Tee — Sand", base_price: 48000, category: "tees", care: "tee", sizes: SIZES_TEE, colors: [{ name: "Sand", hex: "#d8c7a8" }], images: ["the-lost-tee-blue-2.jpg"], material: "240gsm combed cotton", fit: "Relaxed fit.", description: "The manifesto tee in a softer sand wash." },
  { slug: "ringer-tee-navy", title: "Ringer Logo Tee — Navy", base_price: 46000, category: "tees", care: "tee", sizes: SIZES_TEE, colors: [{ name: "Navy", hex: "#1f2a44" }], images: ["ringer-logo-tee-1.jpg"], material: "240gsm combed cotton", fit: "Relaxed fit.", description: "Contrast-sleeve ringer in a deep navy colourway." },
  { slug: "sage-tee-charcoal", title: "Signature Tee — Charcoal", base_price: 44000, category: "tees", care: "tee", sizes: SIZES_TEE, colors: [{ name: "Charcoal", hex: "#3a3a3a" }], images: ["sage-logo-tee-1.jpg"], material: "240gsm combed cotton", fit: "Relaxed fit.", description: "The signature tee in moody charcoal grey." },
  // tops
  { slug: "logo-sweater-stone", title: "Logo Sweater — Stone", base_price: 88000, category: "tops", care: "knit", sizes: SIZES_STD, colors: [{ name: "Stone", hex: "#b8ad9a" }], images: ["orange-logo-sweater-1.jpg"], material: "320gsm cotton-blend fleece", fit: "Regular fit.", description: "The embroidered crew in a neutral stone tone." },
  { slug: "camp-shirt-noir", title: "Monogram Camp Shirt — Noir", base_price: 62000, category: "tops", care: "woven", sizes: SIZES_STD, colors: [BLACK], images: ["dot-camp-shirt-1.jpg"], material: "Woven cotton blend", fit: "Regular camp-collar fit.", description: "The patterned camp shirt in a darker monogram-on-black palette." },
  { slug: "mesh-jersey-navy", title: "Mesh Jersey — Navy", base_price: 68000, category: "tops", care: "knit", sizes: SIZES_STD, colors: [{ name: "Navy", hex: "#1f2a44" }], images: ["zedluxe-mesh-jersey-1.jpg"], material: "Lightweight polyester mesh", fit: "Oversized fit.", description: "The sport mesh jersey in a deep navy." },
  { slug: "patterned-top-mono", title: "Patterned Top — Mono", base_price: 58000, category: "tops", care: "woven", sizes: SIZES_STD, colors: [BLACK], images: ["patterned-top-2.jpg"], material: "Woven cotton blend", fit: "Regular fit.", description: "The monogram patterned top in a monochrome treatment." },
  // sets
  { slug: "signature-set-charcoal", title: "Signature Set — Charcoal", base_price: 115000, badge: "LIMITED", category: "sets", care: "knit", sizes: SIZES_STD, colors: [{ name: "Charcoal", hex: "#3a3a3a" }], images: ["signature-red-set-2.jpg"], material: "300gsm cotton-blend", fit: "Relaxed co-ord fit.", description: "The signature set in an understated charcoal — statement cut, quiet colour." },
  { slug: "tracksuit-stone", title: "Signature Tracksuit — Stone", base_price: 120000, category: "sets", care: "knit", sizes: SIZES_STD, colors: [{ name: "Stone", hex: "#b8ad9a" }], images: ["signature-tracksuit-2.jpg"], material: "320gsm cotton-blend fleece", fit: "Relaxed top, tapered leg.", description: "The flagship tracksuit in a soft stone neutral." },
  { slug: "tracksuit-noir", title: "Signature Tracksuit — Noir", base_price: 120000, badge: "NEW", category: "sets", care: "knit", sizes: SIZES_STD, colors: [BLACK], images: ["signature-tracksuit-1.jpg"], material: "320gsm cotton-blend fleece", fit: "Relaxed top, tapered leg.", description: "The flagship tracksuit in full noir." },
  // outerwear
  { slug: "monogram-set-stone", title: "Monogram Set — Stone", base_price: 125000, category: "outerwear", care: "woven", sizes: SIZES_STD, colors: [{ name: "Stone", hex: "#b8ad9a" }], images: ["floral-satin-jacket-2.jpg"], material: "Premium woven blend", fit: "Relaxed co-ord fit.", description: "The monogram statement set in a neutral stone palette." },
  { slug: "noir-zip-jacket-sand", title: "Zip Jacket — Sand", base_price: 98000, category: "outerwear", care: "outer", sizes: SIZES_STD, colors: [{ name: "Sand", hex: "#d8c7a8" }], images: ["noir-zip-jacket-1.jpg"], material: "Woven shell with brushed lining", fit: "Regular fit.", description: "The versatile zip jacket in a warm sand tone." },
  // bottoms
  { slug: "track-pants-stone", title: "Track Pants — Stone", base_price: 65000, category: "bottoms", care: "knit", sizes: SIZES_STD, colors: [{ name: "Stone", hex: "#b8ad9a" }], images: ["zedluxe-track-pants-2.jpg"], material: "320gsm cotton-blend fleece", fit: "Tapered fit, elastic waist.", description: "The tapered track pant in a neutral stone." },
  { slug: "track-pants-navy", title: "Track Pants — Navy", base_price: 65000, badge: "NEW", category: "bottoms", care: "knit", sizes: SIZES_STD, colors: [{ name: "Navy", hex: "#1f2a44" }], images: ["zedluxe-track-pants-1.jpg"], material: "320gsm cotton-blend fleece", fit: "Tapered fit, elastic waist.", description: "The tapered track pant in deep navy." },
  { slug: "utility-pants-tan", title: "Utility Pant — Tan", base_price: 72000, category: "bottoms", care: "woven", sizes: SIZES_STD, colors: [TAN], images: ["tan-utility-look-1.jpg"], material: "Cotton-twill utility weave", fit: "Relaxed utility fit.", description: "Functional utility trousers in tan — the clean base for any look." },
  // accessories
  { slug: "essential-cap-stone", title: "Essential Cap — Stone", base_price: 35000, category: "accessories", care: "hat", sizes: HAT, colors: [{ name: "Stone", hex: "#b8ad9a" }], images: ["zedluxe-essential-cap-1.jpg"], material: "Cotton twill", fit: "One size, adjustable.", description: "The six-panel cap in a neutral stone." },
  { slug: "bucket-hat-black", title: "Bucket Hat — Black", base_price: 32000, category: "accessories", care: "hat", sizes: HAT, colors: [BLACK], images: ["zedluxe-bucket-hat-1.jpg"], material: "Cotton twill", fit: "One size fits most.", description: "The structured bucket hat in classic black." },
  { slug: "essential-cap-navy", title: "Essential Cap — Navy", base_price: 35000, category: "accessories", care: "hat", sizes: HAT, colors: [{ name: "Navy", hex: "#1f2a44" }], images: ["zedluxe-essential-cap-2.jpg"], material: "Cotton twill", fit: "One size, adjustable.", description: "The six-panel cap in deep navy." },
];

for (const p of pad) await createProduct(p);

const { count } = await sb.from("products").select("*", { count: "exact", head: true });
console.log(`\nTotal products now: ${count}`);
