import type { Benefit, Category, NavLink } from "./types";

export const mainNav: NavLink[] = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections/outerwear" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/lookbook" },
];

export const benefits: Benefit[] = [
  {
    title: "Premium Quality",
    description: "Finest fabrics & craftsmanship.",
    icon: "diamond",
  },
  {
    title: "Exclusive Designs",
    description: "Limited drops. Timeless style.",
    icon: "globe",
  },
  {
    title: "Built Different",
    description: "Made for those who stand out.",
    icon: "crown",
  },
];

export const categories: Category[] = [
  { title: "Tees", slug: "tees", image: "/assets/ig/black_logo_tee_model.jpg" },
  { title: "Outerwear", slug: "outerwear", image: "/assets/ig/striped_jacket_back.jpg" },
  { title: "Sets", slug: "sets", image: "/assets/ig/red_set_models.jpg" },
  { title: "Accessories", slug: "accessories", image: "/assets/ig/black_cap_product.jpg" },
  { title: "Tops", slug: "tops", image: "/assets/ig/green_white_polo_model.jpg" },
  { title: "Bottoms", slug: "bottoms", image: "/assets/ig/blue_tracksuit_model.jpg" },
];

// Community / Instagram strip (4:3 lifestyle imagery)
export const communityImages: { src: string; alt: string }[] = [
  // HD picks from the real IG set via scripts/optimize-community.mjs (min-res guarded).
  { src: "/assets/ig/community-1.jpg", alt: "ZEDLUXE community lifestyle" },
  { src: "/assets/ig/community-2.jpg", alt: "Model in ZEDLUXE on location" },
  { src: "/assets/ig/community-3.jpg", alt: "ZEDLUXE street style" },
  { src: "/assets/ig/community-4.jpg", alt: "ZEDLUXE summer look" },
  { src: "/assets/ig/community-5.jpg", alt: "ZEDLUXE editorial lifestyle" },
  { src: "/assets/ig/community-6.jpg", alt: "Model wearing ZEDLUXE ORIGINALS" },
];

export const footerColumns: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "New Arrivals", href: "/shop?sort=new" },
      { label: "Best Sellers", href: "/shop?sort=best" },
      { label: "Accessories", href: "/collections/accessories" },
      { label: "Sale", href: "/shop?sale=true" },
    ],
  },
  {
    heading: "Collections",
    links: [
      { label: "Tees", href: "/collections/tees" },
      { label: "Hoodies & Sweatshirts", href: "/collections/tops" },
      { label: "Jackets", href: "/collections/outerwear" },
      { label: "Sets", href: "/collections/sets" },
      { label: "Bottoms", href: "/collections/bottoms" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Journal", href: "/lookbook" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Care Guide", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "FAQs", href: "/faq" },
      { label: "Shipping", href: "/legal/shipping-policy" },
      { label: "Returns & Exchanges", href: "/legal/refund-policy" },
      { label: "Terms & Conditions", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy-policy" },
    ],
  },
];

export const socialLinks: NavLink[] = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "TikTok", href: "https://tiktok.com" },
  { label: "X", href: "https://x.com" },
  { label: "YouTube", href: "https://youtube.com" },
];
