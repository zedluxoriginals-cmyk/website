import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import PageHero from "@/components/PageHero";
import Newsletter from "@/components/Newsletter";
import ContactForm from "@/components/contact/ContactForm";
import { supportMethods } from "@/data/content";
import { getFaqCategories } from "@/lib/api/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with ZEDLUXE ORIGINALS for order help, product questions, returns, and collaborations.",
};

export default async function ContactPage() {
  // FAQ shortcut rows — pull a few real questions from the FAQ data.
  const faqCategories = await getFaqCategories();
  const faqShortcuts = faqCategories
    .flatMap((c) => c.items.map((i) => i.q))
    .slice(0, 6);

  return (
    <>
      <Header variant="solid" />

      <PageHero
        eyebrow="Original Pieces. ZEDLUXE."
        title="Get in Touch."
        body={"We're here to help.\nReach out with any questions about orders, products, or collaborations."}
        image="/assets/ig/editorial-hero.jpg"
        imageAlt="ZEDLUXE model seated"
      />

      {/* Form + support */}
      <section className="container-zed grid gap-12 py-16 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-white">
            Send Us A Message
          </h2>
          <p className="mt-2 text-[13px] text-muted">
            Fill out the form below and our team will get back to you as soon as
            possible.
          </p>
          <div className="mt-7">
            <ContactForm />
          </div>
        </div>

        <div className="lg:pl-10">
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-white">
            Customer Support
          </h2>
          <p className="mt-2 text-[13px] text-muted">
            Questions about an order, sizing, or returns? Our support team is
            ready to help.
          </p>
          <ul className="mt-6 divide-y divide-line border-t border-line">
            {supportMethods.map((m) => (
              <li key={m.title} className="py-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-label text-white">
                  {m.title}
                </h3>
                {m.lines.map((line) => (
                  <p key={line} className="mt-1 text-[12px] text-muted">
                    {line}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* HQ + hours */}
      <section className="border-y border-line bg-ink">
        <div className="container-zed grid gap-8 py-12 md:grid-cols-2">
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-label text-white">
              Headquarters
            </h3>
            <address className="mt-4 text-[13px] not-italic leading-relaxed text-muted">
              ZEDLUXE ORIGINALS
              <br />
              Admiralty Way, Lekki Phase 1
              <br />
              Lagos, Nigeria
            </address>
          </div>
          <div className="md:border-l md:border-white/[0.08] md:pl-8">
            <h3 className="text-[11px] font-semibold uppercase tracking-label text-white">
              Store Hours
            </h3>
            <dl className="mt-4 space-y-2 text-[13px] text-muted">
              <div className="flex justify-between max-w-xs">
                <dt>Monday – Friday</dt>
                <dd className="text-white">9:00 AM – 6:00 PM WAT</dd>
              </div>
              <div className="flex justify-between max-w-xs">
                <dt>Saturday</dt>
                <dd className="text-white">10:00 AM – 4:00 PM WAT</dd>
              </div>
              <div className="flex justify-between max-w-xs">
                <dt>Sunday</dt>
                <dd className="text-white">Closed</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] text-soft-muted">
              Hours may vary on public holidays.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ shortcuts */}
      <section className="container-zed py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-white">
              FAQ Shortcuts
            </h2>
            <p className="mt-2 text-[13px] text-muted">
              Find quick answers to the most common questions.
            </p>
          </div>
          <Link
            href="/faq"
            className="text-[11px] font-semibold uppercase tracking-nav text-muted transition hover:text-white"
          >
            View All FAQs
          </Link>
        </div>
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
          {faqShortcuts.map((q) => (
            <Link
              key={q}
              href="/faq"
              className="flex items-center justify-between bg-ink px-5 py-4 text-[13px] text-muted transition hover:bg-charcoal hover:text-white"
            >
              {q}
              <span aria-hidden className="text-soft-muted">→</span>
            </Link>
          ))}
        </div>
      </section>

      <Newsletter />
    </>
  );
}
