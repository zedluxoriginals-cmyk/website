import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import ProductGrid from "@/components/ProductGrid";
import CommunityStrip from "@/components/CommunityStrip";
import Newsletter from "@/components/Newsletter";
import { lookbookStories, lookbookGallery } from "@/data/content";
import { getAllProducts } from "@/lib/api/products";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Purpose in motion. A visual diary of modern identity — Zedluxe Originals, Summer '24.",
};

export default async function LookbookPage() {
  // Shop-the-look curation — live featured products (HD imagery, never stale).
  // 6 fills exactly one row of the desktop grid (lg:grid-cols-6) and tiles
  // cleanly on the 2-col mobile grid — no orphaned partial row.
  const products = await getAllProducts();
  const shopTheLook = [6, 2, 9, 4, 11, 7]
    .map((index) => products[index])
    .filter(Boolean)
    .map((product) => ({
      ...product,
      images:
        product.images.length > 1
          ? [...product.images.slice(1), product.images[0]]
          : product.images,
    }));

  return (
    <>
      <Header variant="solid" />

      <PageHero
        eyebrow="Lookbook — Summer '24"
        title={"Purpose\nIn Motion."}
        body={"A visual diary of modern identity.\nZedluxe Originals — Summer '24."}
        image="/assets/ig/editorial-about-hero.jpg"
        imageAlt="Cinematic ZEDLUXE campaign shot"
        cta={{ label: "Explore The Collection", href: "/shop" }}
      />

      {/* Campaign intro */}
      <section className="border-y border-line bg-ink">
        <div className="container-zed grid gap-6 py-10 md:grid-cols-3 md:items-center">
          <div>
            <p className="eyebrow text-[11px] text-muted">Summer &rsquo;24</p>
            <h2 className="mt-2 font-serif text-[30px] leading-tight text-white">
              Own Your Standard.
            </h2>
          </div>
          <p className="max-w-[440px] text-[13px] leading-relaxed text-muted">
            This season is about movement, confidence, and culture. Pieces
            designed to stand out — wherever you go.
          </p>
          <Link
            href="/shop"
            className="text-[11px] font-semibold uppercase tracking-nav text-white transition hover:opacity-70 md:text-right"
          >
            View Collection →
          </Link>
        </div>
      </section>

      {/* Editorial story cards */}
      <section className="container-zed py-14">
        <div className="grid gap-3 md:grid-cols-3">
          {lookbookStories.map((card) => (
            <article
              key={card.index}
              className="group relative aspect-[1.2/1] overflow-hidden border border-line"
            >
              <Image
                src={card.image}
                alt={card.eyebrow}
                fill
                sizes="(max-width: 767px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[10px] uppercase tracking-label text-warm-grey">
                  {card.index} / {card.eyebrow}
                </p>
                <h3 className="mt-2 whitespace-pre-line font-serif text-[26px] leading-tight text-white">
                  {card.title}
                </h3>
                <p className="mt-2 text-[12px] text-off-white/80">{card.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Main lookbook gallery — editorial mosaic (packs clean, no gaps) */}
      <section className="container-zed pb-14">
        <SectionHeader title="The Lookbook" viewAllHref="/shop" />
        <div className="grid auto-rows-[150px] grid-cols-2 gap-2.5 sm:auto-rows-[200px] md:grid-cols-4 md:gap-3">
          {lookbookGallery.map((img, i) => (
            <div
              key={img.src}
              className={`group relative overflow-hidden border border-white/[0.05] bg-charcoal-2 ${
                // Feature tile goes full-width (2 cols × 2 rows) on mobile too.
                i === 0 ? "col-span-2 row-span-2" : ""
              } ${img.span}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Featured campaign banner */}
      <section className="relative h-[300px] w-full overflow-hidden border-y border-line">
        <Image
          src="/assets/ig/editorial-gallery-1.jpg"
          alt="Own Your Standard campaign"
          fill
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />
        <div className="container-zed relative flex h-full flex-col justify-center">
          <p className="eyebrow text-[11px] text-warm-grey">Featured Campaign</p>
          <h2 className="mt-3 font-serif text-[36px] leading-[0.95] text-white md:text-[48px]">
            Own Your<br />Standard.
          </h2>
          <p className="mt-3 max-w-sm text-[13px] text-off-white">
            A collection built for movement, rooted in purpose.
          </p>
        </div>
      </section>

      {/* Shop the look */}
      <section className="container-zed py-14">
        <SectionHeader title="Shop The Look" viewAllHref="/shop" />
        <ProductGrid products={shopTheLook} />
      </section>

      <CommunityStrip />
      <Newsletter />
    </>
  );
}
