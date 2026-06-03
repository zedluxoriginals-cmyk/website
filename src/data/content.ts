/*
  Editorial / support content for Batch 2 pages (About, Lookbook, Contact, FAQ).
  Authored statically for the design build; these map to Supabase content
  tables later (faq_categories / faq_items, lookbook_collections /
  lookbook_items, content_pages — see docs/backend/functionality.md).

  Localized for the Nigerian market (Naira pricing, Lagos HQ, WAT hours).
*/

// ---------- About ----------

export const brandTimeline: { year: string; title: string; body: string }[] = [
  { year: "2020", title: "The Spark", body: "ZEDLUXE was born from a vision to redefine everyday essentials." },
  { year: "2021", title: "First Drop", body: "Our debut collection set the tone for quality, fit, and purpose." },
  { year: "2022", title: "Growing Culture", body: "A community started to form — rooted in style and mindset." },
  { year: "2023", title: "Expanding Vision", body: "New collections, bigger moments, same mission." },
  { year: "2024", title: "Built Different", body: "ZEDLUXE continues to evolve — setting our own standard." },
];

export const craftValues: { title: string; body: string }[] = [
  { title: "Premium Fabrics", body: "Hand-selected materials for comfort and durability." },
  { title: "Precision Craft", body: "Every stitch. Every detail. Elevated craftsmanship." },
  { title: "Timeless Design", body: "Minimal today. Iconic forever." },
  { title: "Responsible Mindset", body: "Mindful production. Conscious choices." },
];

// ---------- Lookbook ----------

export type StoryCard = {
  index: string;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
};

export const lookbookStories: StoryCard[] = [
  {
    index: "01",
    eyebrow: "City Nights",
    title: "After Dark.\nNo Rules.",
    body: "The city is your canvas. Move different.",
    image: "/assets/ig/editorial-story-1.jpg",
  },
  {
    index: "02",
    eyebrow: "Rooted",
    title: "Rooted\nIn Culture.",
    body: "Heritage in every stitch. Pride in every detail.",
    image: "/assets/ig/editorial-story-2.jpg",
  },
  {
    index: "03",
    eyebrow: "Everyday Excellence",
    title: "Elevated\nEssentials.",
    body: "Timeless staples. Refined for every day.",
    image: "/assets/ig/editorial-hero.jpg",
  },
];

// Editorial mosaic — curated lifestyle shots cropped to pack a clean 4×3 block
// with no gaps:  [FEATURE 2x2][A][B] / [FEATURE][C wide 2x1] / [D][E][F wide 2x1]
export const lookbookGallery: { src: string; alt: string; span: string }[] = [
  { src: "/assets/ig/lookbook-feature.jpg", alt: "ZEDLUXE statement jersey, full look", span: "md:col-span-2 md:row-span-2" },
  { src: "/assets/ig/lookbook-a.jpg", alt: "Signature polo, seated", span: "md:col-span-1 md:row-span-1" },
  { src: "/assets/ig/lookbook-b.jpg", alt: "Monogram tee", span: "md:col-span-1 md:row-span-1" },
  { src: "/assets/ig/lookbook-c.jpg", alt: "Two models in ZEDLUXE sets", span: "md:col-span-2 md:row-span-1" },
  { src: "/assets/ig/lookbook-d.jpg", alt: "ZEDLUXE logo tee", span: "md:col-span-1 md:row-span-1" },
  { src: "/assets/ig/lookbook-e.jpg", alt: "Monogram look on location", span: "md:col-span-1 md:row-span-1" },
  { src: "/assets/ig/lookbook-f.jpg", alt: "Monogram tee, street style", span: "md:col-span-2 md:row-span-1" },
];

// ---------- Contact ----------

export const supportMethods: { title: string; lines: string[] }[] = [
  { title: "Email Support", lines: ["support@zedluxe.com", "We reply within 24 hours."] },
  { title: "Live Chat", lines: ["Available on our website", "Mon–Fri, 9AM – 6PM WAT"] },
  { title: "Order Support", lines: ["Help with tracking, returns,", "exchanges, and more."] },
  { title: "Wholesale / Collabs", lines: ["partners@zedluxe.com", "For partnerships and inquiries."] },
];

export const contactSubjects = [
  "Order Help",
  "Product Question",
  "Returns & Exchanges",
  "Wholesale / Collaboration",
  "Something Else",
];

// ---------- FAQ ----------

export type FaqItem = { q: string; a: string };
export type FaqCategory = { title: string; items: FaqItem[] };

// ---------- Legal pages ----------
// Reusable template content → Supabase `content_pages` later. NG-localized.

export type LegalSection = { heading: string; body: string[] };
export type LegalPage = {
  slug: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export const legalPages: LegalPage[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    updated: "June 2026",
    intro:
      "This policy explains how ZEDLUXE ORIGINALS collects, uses, and protects your personal information when you shop with us.",
    sections: [
      { heading: "Information We Collect", body: ["We collect the details you provide at checkout — name, email, phone number, and delivery address — and basic information about how you use the site."] },
      { heading: "How We Use It", body: ["To process orders, arrange delivery, provide support, and (with your consent) send you updates about new drops and offers."] },
      { heading: "Payments", body: ["Payments are processed securely by Paystack. We never see or store your full card details."] },
      { heading: "Your Rights", body: ["You can request access to, correction of, or deletion of your data at any time by contacting support@zedluxe.com."] },
    ],
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    updated: "June 2026",
    intro: "By using this website and placing an order, you agree to the following terms.",
    sections: [
      { heading: "Orders", body: ["All orders are subject to acceptance and availability. Prices are listed in Nigerian Naira (₦) and include applicable charges shown at checkout."] },
      { heading: "Pricing", body: ["We reserve the right to correct pricing errors. If a price is wrong, we will contact you before processing your order."] },
      { heading: "Intellectual Property", body: ["All content, branding, and imagery on this site belong to ZEDLUXE ORIGINALS and may not be reused without permission."] },
    ],
  },
  {
    slug: "refund-policy",
    title: "Returns & Exchanges",
    updated: "June 2026",
    intro: "We want you to love your pieces. If something isn't right, here's how returns work.",
    sections: [
      { heading: "Return Window", body: ["Unworn items in original condition with tags attached can be returned within 14 days of delivery."] },
      { heading: "How to Return", body: ["Contact support@zedluxe.com with your order number to start a return or exchange. We'll guide you through the next steps."] },
      { heading: "Refunds", body: ["Approved refunds are processed to your original payment method within 5–7 business days of us receiving the item."] },
      { heading: "Non-Returnable", body: ["Sale items and accessories such as caps and bucket hats are final sale unless faulty."] },
    ],
  },
  {
    slug: "shipping-policy",
    title: "Shipping Policy",
    updated: "June 2026",
    intro: "Everything you need to know about how and when your order arrives.",
    sections: [
      { heading: "Where We Ship", body: ["We currently ship nationwide across Nigeria. International shipping is coming soon."] },
      { heading: "Processing & Delivery", body: ["Orders are processed within 1–2 business days. Delivery times depend on your location and the option selected at checkout."] },
      { heading: "Free Shipping", body: ["Enjoy free shipping on orders over ₦150,000. Standard rates are calculated at checkout for all other orders."] },
      { heading: "Tracking", body: ["You'll receive a tracking link by email once your order ships."] },
    ],
  },
];

export const legalPageBySlug = (slug: string) =>
  legalPages.find((p) => p.slug === slug);

export const faqCategories: FaqCategory[] = [
  {
    title: "Shipping",
    items: [
      { q: "Where do you ship?", a: "We ship nationwide across Nigeria, with international options shown at checkout based on your location." },
      { q: "How long will it take to receive my order?", a: "Orders are usually processed within 1–2 business days. Delivery time depends on your location and selected shipping method." },
      { q: "Do you offer free shipping?", a: "Yes. Free shipping is available on orders over ₦150,000." },
      { q: "Will I receive a tracking number?", a: "Yes. Once your order ships, you will receive a tracking link by email." },
    ],
  },
  {
    title: "Returns & Exchanges",
    items: [
      { q: "What is your return policy?", a: "Unworn items in original condition can be returned within 14 days of delivery." },
      { q: "How do I exchange an item?", a: "Start an exchange from your account or contact support with your order number, and we'll guide you through it." },
      { q: "When will I be refunded?", a: "Refunds are processed to your original payment method within 5–7 business days of us receiving the return." },
    ],
  },
  {
    title: "Sizing & Fit",
    items: [
      { q: "How do your pieces fit?", a: "Most pieces are cut for an elevated, relaxed fit. Check the size guide on each product for exact measurements." },
      { q: "What if I'm between sizes?", a: "For an oversized look, size up. For a closer fit, size down." },
    ],
  },
  {
    title: "Payments",
    items: [
      { q: "What payment methods do you accept?", a: "We accept cards, bank transfer, and USSD through our secure Paystack checkout." },
      { q: "Is my payment information secure?", a: "Yes. Payments are handled by Paystack — we never store your card details." },
    ],
  },
  {
    title: "Orders",
    items: [
      { q: "How do I track my order?", a: "Use the tracking link in your shipping email, or view order status in your account." },
      { q: "Can I change or cancel my order?", a: "Contact us as soon as possible. We can usually amend orders before they ship." },
    ],
  },
  {
    title: "Product Care",
    items: [
      { q: "How should I care for my pieces?", a: "Wash cold, inside out, and air dry to preserve fabric and print. Avoid high heat." },
    ],
  },
];
