import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import PageHero from "@/components/PageHero";
import Newsletter from "@/components/Newsletter";
import SizeCharts from "@/components/sizeguide/SizeCharts";
import { howToMeasure, fitNotes } from "@/data/sizeGuide";
import { getSizeCharts } from "@/lib/api/content";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "Find your fit. Garment measurements across every ZEDLUXE collection, in inches and centimetres.",
};

export default async function SizeGuidePage() {
  const sizeCharts = await getSizeCharts();
  return (
    <>
      <Header variant="solid" />

      <PageHero
        eyebrow="Home / Size Guide"
        title="Find Your Fit."
        body="The right fit changes everything. Use our size guide to find your perfect size across our collections."
        image="/assets/ig/editorial-hero.jpg"
        imageAlt="Seated ZEDLUXE model in a tee"
      />

      <section className="container-zed py-14">
        <SizeCharts sizeCharts={sizeCharts} />
      </section>

      {/* How to measure */}
      <section className="border-t border-line bg-ink">
        <div className="container-zed py-14">
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-white">
            How To Measure
          </h2>
          <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {howToMeasure.map((m) => (
              <div key={m.title} className="bg-ink p-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-label text-white">
                  {m.title}
                </h3>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fit notes */}
      <section className="container-zed py-14">
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-white">
          Fit Notes
        </h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {fitNotes.map((n, i) => (
            <div key={n.title} className={i > 0 ? "md:border-l md:border-white/[0.08] md:pl-8" : ""}>
              <h3 className="font-serif text-[20px] text-white">{n.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{n.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-[13px] text-muted">
          Still unsure?{" "}
          <Link href="/contact" className="text-white underline underline-offset-2 hover:opacity-70">
            Contact our team
          </Link>{" "}
          and we&apos;ll help you find the right fit.
        </p>
      </section>

      <Newsletter />
    </>
  );
}
