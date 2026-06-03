import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import PageHero from "@/components/PageHero";
import Newsletter from "@/components/Newsletter";
import FaqAccordion from "@/components/faq/FaqAccordion";
import { getFaqCategories } from "@/lib/api/content";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Everything you need to know — shipping, returns, sizing, payments, orders, and product care.",
};

export default async function FaqPage() {
  const faqCategories = await getFaqCategories();
  return (
    <>
      <Header variant="solid" />

      <PageHero
        title="FAQs"
        body={"Everything you need to know.\nStraight answers. No fluff."}
        image="/assets/ig/black_logo_tee_model.jpg"
        imageAlt="ZEDLUXE model in a logo tee"
      />

      <section className="container-zed py-14">
        <FaqAccordion categories={faqCategories} />

        {/* Still need help */}
        <div className="mt-12 border border-line bg-ink p-8 text-center">
          <h2 className="font-serif text-[26px] text-white">Still need help?</h2>
          <p className="mt-3 text-[13px] text-muted">
            Can&apos;t find what you&apos;re looking for? Our team is here for you.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex h-[44px] min-w-[160px] items-center justify-center bg-white px-6 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
