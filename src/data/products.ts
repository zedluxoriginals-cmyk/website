import type { Product } from "./types";

/*
  Static mock catalogue. Images map to the IG-based source library in
  /public/assets/ig (square 1024 crops). Prices are in Naira (NGN) —
  whole-Naira display strings, parsed to kobo for cart math via lib/money.
  Replaced by Supabase product/variant data once the backend lands (Phase 7).
*/

const C = {
  black: { name: "Black", hex: "#111111" },
  cream: { name: "Cream", hex: "#f0eadf" },
  brown: { name: "Brown", hex: "#5a3d2e" },
  blue: { name: "Blue", hex: "#2c3e63" },
  red: { name: "Red", hex: "#7a1f23" },
  beige: { name: "Beige", hex: "#c7bfb5" },
  white: { name: "White", hex: "#f3f1ec" },
  green: { name: "Green", hex: "#3c4a32" },
  purple: { name: "Purple", hex: "#3a2a44" },
} as const;

const TEE = ["XS", "S", "M", "L", "XL"];
const ACC = ["One Size"];

export const products: Product[] = [
  {
    id: "p-classic-logo-tee",
    slug: "classic-logo-tee",
    title: "Classic Logo Tee",
    price: "₦45,000",
    category: "tees",
    images: ["/assets/ig/brown_logo_tee_close_lifestyle.jpg", "/assets/ig/black_logo_tee_model.jpg"],
    colors: [C.black, C.cream, C.brown],
    sizes: TEE,
    badge: "NEW",
    description:
      "A premium-weight cotton tee carrying the ZEDLUXE signature logo. Cut for an elevated everyday fit.",
  },
  {
    id: "p-essential-cap",
    slug: "zedluxe-essential-cap",
    title: "Zedluxe Essential Cap",
    price: "₦35,000",
    category: "accessories",
    images: ["/assets/ig/black_cap_product.jpg", "/assets/ig/red_cap_product.jpg"],
    colors: [C.black, C.red],
    sizes: ACC,
    badge: "NEW",
    description: "Structured six-panel cap with a low-profile embroidered mark.",
  },
  {
    id: "p-floral-satin-jacket",
    slug: "floral-satin-jacket",
    title: "Floral Satin Jacket",
    price: "₦135,000",
    category: "outerwear",
    images: ["/assets/ig/floral_satin_jacket_product.jpg", "/assets/ig/striped_jacket_back.jpg"],
    colors: [C.black, C.green],
    sizes: TEE,
    badge: "LIMITED",
    description:
      "A statement satin jacket with an all-over floral motif. A limited outerwear drop built to stand out.",
  },
  {
    id: "p-mesh-jersey",
    slug: "zedluxe-mesh-jersey",
    title: "Zedluxe Mesh Jersey",
    price: "₦68,000",
    category: "tops",
    images: ["/assets/ig/rugby_47_jersey_product.jpg", "/assets/ig/green_white_polo_model.jpg"],
    colors: [C.green, C.white],
    sizes: TEE,
    description: "Breathable mesh jersey with a relaxed cut and contrast trims.",
  },
  {
    id: "p-signature-tracksuit",
    slug: "signature-tracksuit",
    title: "Signature Tracksuit",
    price: "₦120,000",
    category: "sets",
    images: ["/assets/ig/beige_tracksuit_model.jpg", "/assets/ig/beige_tracksuit_closeup.jpg"],
    colors: [C.beige, C.blue],
    sizes: TEE,
    badge: "LIMITED",
    description: "A coordinated two-piece tracksuit in a soft brushed finish.",
  },
  {
    id: "p-minimal-logo-tee",
    slug: "minimal-logo-tee",
    title: "Minimal Logo Tee",
    price: "₦42,000",
    category: "tees",
    images: ["/assets/ig/white_tee_living_room.jpg", "/assets/ig/white_tee_back_laptop.jpg"],
    colors: [C.white, C.black],
    sizes: TEE,
    description: "A pared-back tee with a tonal chest mark. Everyday essential.",
  },
  {
    id: "p-logo-hoodie",
    slug: "zedluxe-logo-hoodie",
    title: "Zedluxe Logo Hoodie",
    price: "₦95,000",
    category: "tops",
    images: ["/assets/ig/purple_black_sweatshirt_model.jpg", "/assets/ig/black_47_sweater_model.jpg"],
    colors: [C.purple, C.black],
    sizes: TEE,
    badge: "NEW",
    description: "Heavyweight fleece hoodie with a structured hood and signature mark.",
  },
  {
    id: "p-track-pants",
    slug: "zedluxe-track-pants",
    title: "Zedluxe Track Pants",
    price: "₦65,000",
    category: "bottoms",
    images: ["/assets/ig/black_top_red_pants_plane.jpg", "/assets/ig/blue_tracksuit_model.jpg"],
    colors: [C.red, C.blue],
    sizes: TEE,
    description: "Tapered track pants with a refined drape and tonal piping.",
  },
  {
    id: "p-lost-tee",
    slug: "the-lost-tee-blue",
    title: "The Lost Tee",
    price: "₦48,000",
    category: "tees",
    images: ["/assets/ig/blue_lost_tee_back.jpg", "/assets/ig/blue_logo_tee_model.jpg"],
    colors: [C.blue],
    sizes: TEE,
    badge: "NEW",
    description: '"The Lost" back-print tee in deep blue. A graphic statement piece.',
  },
  {
    id: "p-red-set",
    slug: "signature-red-set",
    title: "Signature Set",
    price: "₦115,000",
    category: "sets",
    images: ["/assets/ig/red_set_models.jpg", "/assets/ig/black_red_set_duo.jpg"],
    colors: [C.red, C.black],
    sizes: TEE,
    badge: "LIMITED",
    description: "A bold coordinated set designed to be worn together or apart.",
  },
  {
    id: "p-patterned-top",
    slug: "patterned-top",
    title: "Patterned Knit Top",
    price: "₦58,000",
    category: "tops",
    images: ["/assets/ig/patterned_green_top_front.jpg", "/assets/ig/patterned_green_top_back.jpg"],
    colors: [C.green],
    sizes: TEE,
    description: "Textured knit top with an all-over pattern and clean neckline.",
  },
  {
    id: "p-bucket-hat",
    slug: "zedluxe-bucket-hat",
    title: "Zedluxe Bucket Hat",
    price: "₦32,000",
    category: "accessories",
    images: ["/assets/ig/bucket_hat_product.jpg"],
    colors: [C.red, C.black],
    sizes: ACC,
    description: "Reversible bucket hat with an embroidered mark.",
  },
];

export const productBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

export const productsByCategory = (category: string) =>
  products.filter((p) => p.category === category);

// Homepage curation
export const latestArrivals = [
  "classic-logo-tee",
  "zedluxe-essential-cap",
  "floral-satin-jacket",
  "zedluxe-mesh-jersey",
  "signature-tracksuit",
  "minimal-logo-tee",
].map((s) => productBySlug(s)!);

export const bestSellers = [
  "zedluxe-logo-hoodie",
  "zedluxe-track-pants",
  "floral-satin-jacket",
  "classic-logo-tee",
  "zedluxe-essential-cap",
  "the-lost-tee-blue",
].map((s) => productBySlug(s)!);
