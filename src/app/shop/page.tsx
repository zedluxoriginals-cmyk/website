import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import ShopBrowser from "@/components/shop/ShopBrowser";
import { getAllProducts } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse the full ZEDLUXE ORIGINALS collection of elevated essentials.",
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ]);

  // Only surface categories that actually have products.
  const activeCategories = categories.filter((c) =>
    products.some((p) => p.category === c.slug),
  );

  return (
    <>
      <Header variant="solid" />
      <main className="container-zed pb-16 pt-10">
        <div className="mb-8">
          <p className="eyebrow text-[11px] text-muted">Collection</p>
          <h1 className="mt-2 font-serif text-[40px] leading-none text-white md:text-[52px]">
            Shop All
          </h1>
        </div>

        {/* useSearchParams needs a Suspense boundary during prerender. */}
        <Suspense fallback={null}>
          <ShopBrowser products={products} categories={activeCategories} />
        </Suspense>
      </main>
    </>
  );
}
