import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ProductDetail from "@/components/product/ProductDetail";
import SectionHeader from "@/components/SectionHeader";
import ProductGrid from "@/components/ProductGrid";
import RecentlyViewed from "@/components/wishlist/RecentlyViewed";
import { getAllProducts, getProductBySlug } from "@/lib/api/products";

export async function generateMetadata(
  props: PageProps<"/products/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not Found" };
  return {
    title: product.title,
    description: product.description,
    openGraph: { images: [product.images[0]] },
  };
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getAllProducts(),
  ]);
  if (!product) notFound();

  // Related: same category, excluding the current product.
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 6);

  return (
    <>
      <Header variant="solid" />
      <main className="container-zed pb-16 pt-10">
        <ProductDetail product={product} />

        {related.length > 0 && (
          <section className="mt-20">
            <SectionHeader title="You May Also Like" />
            <ProductGrid products={related} />
          </section>
        )}
      </main>

      {/* Recently viewed (client) — pass the catalogue so it can resolve slugs */}
      <RecentlyViewed excludeSlug={product.slug} catalogue={allProducts} />
    </>
  );
}
