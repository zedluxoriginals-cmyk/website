import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { getLegalPage } from "@/lib/api/content";

export async function generateMetadata(
  props: PageProps<"/legal/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const page = await getLegalPage(slug);
  if (!page) return { title: "Not Found" };
  return {
    title: page.title,
    description: page.intro,
  };
}

export default async function LegalPage(props: PageProps<"/legal/[slug]">) {
  const { slug } = await props.params;
  const page = await getLegalPage(slug);
  if (!page) notFound();

  return (
    <>
      <Header variant="solid" />
      <main className="container-zed pb-20 pt-12">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-[11px] text-muted">Legal</p>
          <h1 className="mt-2 font-serif text-[40px] leading-none text-white md:text-[48px]">
            {page.title}
          </h1>
          <p className="mt-3 text-[11px] uppercase tracking-label text-soft-muted">
            Last updated: {page.updated}
          </p>
          <p className="mt-6 text-[14px] leading-relaxed text-muted">{page.intro}</p>

          <div className="mt-10 space-y-10">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-[13px] font-semibold uppercase tracking-wide text-white">
                  {section.heading}
                </h2>
                {section.body.map((para, i) => (
                  <p key={i} className="mt-3 text-[14px] leading-relaxed text-muted">
                    {para}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
