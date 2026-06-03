"use client";

import { useWishlist } from "./WishlistProvider";
import ProductGrid from "@/components/ProductGrid";
import SectionHeader from "@/components/SectionHeader";
import type { Product } from "@/data/types";

/*
  Recently-viewed strip. Renders nothing until hydrated or when empty, so it
  never causes a mismatch and never shows an empty shell. `excludeSlug` lets
  the PDP omit the product currently being viewed.

  The `catalogue` (server-fetched product list) is passed in so this client
  component can resolve stored slugs → products without importing server data.
*/

export default function RecentlyViewed({
  catalogue,
  excludeSlug,
  title = "Recently Viewed",
}: {
  catalogue: Product[];
  excludeSlug?: string;
  title?: string;
}) {
  const { recentlyViewed, hydrated } = useWishlist();
  if (!hydrated) return null;

  const bySlug = new Map(catalogue.map((p) => [p.slug, p]));
  const products = recentlyViewed
    .filter((slug) => slug !== excludeSlug)
    .map((slug) => bySlug.get(slug))
    .filter((p): p is Product => Boolean(p));

  if (products.length === 0) return null;

  return (
    <section className="container-zed py-12">
      <SectionHeader title={title} />
      <ProductGrid products={products} />
    </section>
  );
}
