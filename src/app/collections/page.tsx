import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import PageHero from "@/components/PageHero";
import CommunityStrip from "@/components/CommunityStrip";
import Newsletter from "@/components/Newsletter";
import { getCategories } from "@/lib/api/categories";
import { getAllProducts } from "@/lib/api/products";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Explore every ZEDLUXE ORIGINALS collection — tees, outerwear, sets, tops, bottoms and accessories. Premium essentials, elevated.",
};

export default async function CollectionsPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getAllProducts(),
  ]);

  const countFor = (slug: string) =>
    products.filter((p) => p.category === slug).length;

  return (
    <>
      <Header variant="solid" />

      <PageHero
        eyebrow="Browse The Range"
        title={"Our\nCollections."}
        body="Six edits, one standard. From everyday tees to statement outerwear — find the pieces built around how you actually move."
        image="/assets/ig/editorial-gallery-3.jpg"
        imageAlt="ZEDLUXE ORIGINALS collections"
      />

      {/* Editorial collection cards — alternating large feature + grid */}
      <section className="container-zed py-14">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => {
            const count = countFor(cat.slug);
            // First card spans full width on large screens for an editorial accent.
            const feature = i === 0;
            return (
              <Link
                key={cat.slug}
                href={`/collections/${cat.slug}`}
                className={`group relative block overflow-hidden border border-line bg-[#151515] ${
                  feature
                    ? "aspect-[4/5] sm:aspect-[16/10] lg:col-span-2 lg:aspect-auto lg:min-h-[440px]"
                    : "aspect-[4/5]"
                }`}
              >
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes={
                    feature
                      ? "(max-width: 1023px) 100vw, 66vw"
                      : "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  }
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-[26px] leading-tight text-white md:text-[32px]">
                        {cat.title}
                      </h2>
                      {cat.description ? (
                        <p className="mt-2 max-w-md text-[12px] leading-relaxed text-off-white/80 line-clamp-2">
                          {cat.description}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-[11px] uppercase tracking-label text-warm-grey">
                      {count} {count === 1 ? "piece" : "pieces"}
                    </span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-nav text-white transition group-hover:gap-3">
                    Shop {cat.title}
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Reassurance / CTA band */}
      <section className="border-y border-line bg-charcoal">
        <div className="container-zed flex flex-col items-center gap-5 py-12 text-center">
          <p className="eyebrow text-[11px] text-muted">Can&rsquo;t Decide?</p>
          <h2 className="font-serif text-[28px] leading-tight text-white md:text-[34px]">
            Shop The Full Catalogue.
          </h2>
          <Link
            href="/shop"
            className="inline-flex h-[46px] min-w-[200px] items-center justify-center bg-white px-6 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white"
          >
            View All Products
          </Link>
        </div>
      </section>

      <CommunityStrip />
      <Newsletter />
    </>
  );
}
