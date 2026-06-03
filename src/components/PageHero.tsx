import Image from "next/image";

/*
  Shared editorial hero for inner pages (About / Lookbook / Contact / FAQ).
  Dark image, left-to-right gradient, left-aligned serif headline. The
  header is rendered separately and sits above this (solid variant).
*/

export default function PageHero({
  eyebrow,
  title,
  body,
  image,
  imageAlt,
  cta,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  image: string;
  imageAlt: string;
  cta?: { label: string; href: string };
}) {
  return (
    <section className="relative h-[420px] w-full overflow-hidden bg-charcoal md:h-[480px]">
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%]"
      />
      {/* Left-to-right dark gradient for legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20" />

      <div className="container-zed relative flex h-full flex-col justify-center">
        <div className="max-w-[520px]">
          {eyebrow && (
            <p className="eyebrow text-[11px] text-warm-grey">{eyebrow}</p>
          )}
          <h1 className="mt-3 whitespace-pre-line font-serif text-[44px] leading-[0.95] text-white md:text-[64px]">
            {title}
          </h1>
          {body && (
            <p className="mt-5 max-w-prose whitespace-pre-line text-[15px] leading-relaxed text-off-white">
              {body}
            </p>
          )}
          {cta && (
            <a
              href={cta.href}
              className="mt-7 inline-flex h-[44px] min-w-[150px] items-center justify-center bg-white px-6 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white"
            >
              {cta.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
