import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import PageHero from "@/components/PageHero";
import Newsletter from "@/components/Newsletter";
import CommunityStrip from "@/components/CommunityStrip";
import { benefitIcons } from "@/components/icons";
import { benefits } from "@/data/site";
import { brandTimeline, craftValues } from "@/data/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Our story, our standard. ZEDLUXE ORIGINALS was built on the belief that essentials should be anything but ordinary.",
};

export default function AboutPage() {
  return (
    <>
      <Header variant="solid" />

      <PageHero
        eyebrow="Original Pieces. ZEDLUXE."
        title={"Our Story.\nOur Standard."}
        body="ZEDLUXE ORIGINALS was built on the belief that essentials should be anything but ordinary. Rooted in culture. Driven by purpose. Made for those who stand out."
        image="/assets/ig/editorial-about-hero.jpg"
        imageAlt="Model wearing a statement ZEDLUXE jacket"
      />

      {/* Mission + values */}
      <section className="border-y border-line bg-ink">
        <div className="container-zed grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <p className="eyebrow text-[11px] text-muted">Our Mission</p>
            <h2 className="mt-3 font-serif text-[30px] leading-tight text-white">
              Elevate Everyday.
            </h2>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted">
              We create premium essentials with elevated design, uncompromising
              quality, and cultural relevance — so you can move with confidence
              and live on your terms.
            </p>
          </div>
          {benefits.map((b) => {
            const Icon = benefitIcons[b.icon];
            return (
              <div key={b.title} className="md:border-l md:border-white/[0.08] md:pl-8">
                <Icon className="h-7 w-7 text-white" />
                <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-label text-white">
                  {b.title}
                </h3>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Journey timeline */}
      <section className="container-zed py-16">
        <p className="eyebrow text-[11px] text-muted">Our Journey</p>
        <div className="mt-8 grid gap-px border-t border-white/20 md:grid-cols-5">
          {brandTimeline.map((t) => (
            <div key={t.year} className="relative pt-6 md:pr-6">
              <span className="absolute -top-[5px] left-0 h-2.5 w-2.5 rounded-full bg-white" />
              <p className="text-[18px] tracking-[0.18em] text-white">{t.year}</p>
              <h3 className="mt-3 text-[11px] font-semibold uppercase tracking-label text-warm-grey">
                {t.title}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-muted">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quality editorial */}
      <section className="border-y border-line">
        <div className="container-zed grid items-center gap-10 py-0 md:grid-cols-[55%_45%]">
          <div className="relative aspect-[4/3] overflow-hidden bg-charcoal-2 md:aspect-auto md:h-[460px]">
            <Image
              src="/assets/ig/editorial-craft.jpg"
              alt="Close detail of ZEDLUXE craftsmanship"
              fill
              sizes="(max-width: 767px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
          <div className="py-10 md:py-0 md:pl-4">
            <p className="eyebrow text-[11px] text-muted">Quality Over Everything</p>
            <h2 className="mt-3 font-serif text-[34px] leading-tight text-white md:text-[40px]">
              Details Define Us.
            </h2>
            <p className="mt-5 max-w-prose text-[13px] leading-relaxed text-muted">
              From heavyweight fabrics to precision stitching, every piece is
              crafted to last and made to move with you — day in, day out.
            </p>
            <Link
              href="/shop"
              className="mt-7 inline-flex h-[44px] min-w-[180px] items-center justify-center bg-white px-6 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white"
            >
              Explore Collections
            </Link>
          </div>
        </div>
      </section>

      {/* Craft value strip */}
      <section className="bg-charcoal">
        <div className="container-zed grid gap-8 py-12 md:grid-cols-4">
          {craftValues.map((v, i) => (
            <div key={v.title} className={i > 0 ? "md:border-l md:border-white/[0.08] md:pl-8" : ""}>
              <h3 className="text-[11px] font-semibold uppercase tracking-label text-white">
                {v.title}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-muted">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Manifesto quote */}
      <section className="relative overflow-hidden">
        <Image
          src="/assets/ig/editorial-hero.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_25%] opacity-30"
        />
        <div className="container-zed relative py-20 text-center">
          <p className="eyebrow text-[11px] text-warm-grey">The ZEDLUXE Mindset</p>
          <blockquote className="mx-auto mt-5 max-w-2xl font-serif text-[32px] leading-tight text-white md:text-[44px]">
            “We don’t follow the culture. We shape it.”
          </blockquote>
          <p className="mt-5 text-[11px] uppercase tracking-label text-muted">
            — Founder, ZEDLUXE ORIGINALS
          </p>
        </div>
      </section>

      <CommunityStrip />
      <Newsletter />
    </>
  );
}
