import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ShopBrowser from "@/components/shop/ShopBrowser";
import { getAllProducts } from "@/lib/api/products";
import { getCategories, getCategoryBySlug } from "@/lib/api/categories";

export async function generateMetadata(
  props: PageProps<"/collections/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Not Found" };
  return {
    title: category.title,
    description: `Shop ${category.title} from ZEDLUXE ORIGINALS.`,
  };
}

export default async function CollectionPage(
  props: PageProps<"/collections/[slug]">,
) {
  const { slug } = await props.params;
  const [category, products, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getAllProducts(),
    getCategories(),
  ]);
  if (!category) notFound();

  const inCategory = products.filter((p) => p.category === slug);

  return (
    <>
      <Header variant="solid" />
      <main className="container-zed pb-16 pt-10">
        <div className="mb-8">
          <p className="eyebrow text-[11px] text-muted">Collection</p>
          <h1 className="mt-2 font-serif text-[40px] leading-none text-white md:text-[52px]">
            {category.title}
          </h1>
        </div>

        <Suspense fallback={null}>
          <ShopBrowser
            products={inCategory}
            categories={categories}
            lockedCategory={slug}
          />
        </Suspense>
      </main>
    </>
  );
}
