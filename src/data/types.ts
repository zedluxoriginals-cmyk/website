export type Badge = "NEW" | "SALE" | "LIMITED";

export type Product = {
  id: string;
  slug: string;
  title: string;
  price: string;
  category: string;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  badge?: Badge;
  description: string;
};

export type Category = {
  title: string;
  slug: string;
  image: string;
  description?: string;
};

export type Benefit = {
  title: string;
  description: string;
  icon: "diamond" | "globe" | "crown";
};

export type NavLink = { label: string; href: string };

/*
  Cart line. A unique line is keyed by product + size + color, so the same
  tee in two sizes is two lines. `priceCents` is snapshotted at add-time
  (parsed from Product.price) so totals never re-parse display strings.
*/
export type CartLine = {
  key: string; // `${productId}::${size}::${color}`
  productId: string;
  slug: string;
  title: string;
  image: string;
  priceCents: number;
  size: string;
  color: string;
  quantity: number;
};
