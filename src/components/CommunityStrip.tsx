import Image from "next/image";
import { communityImages } from "@/data/site";

const IG_URL = "https://instagram.com/zedluxeoriginals";
const IG_HANDLE = "@zedluxeoriginals";

export default function CommunityStrip() {
  return (
    <section className="border-t border-line bg-ink">
      <div className="container-zed py-14">
        <div className="mb-8 flex flex-col gap-4 text-center">
          <p className="eyebrow text-[11px] text-muted">The Community</p>
          <h2 className="font-serif text-[30px] leading-tight text-white md:text-[38px]">
            Worn By The Culture.
          </h2>
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-nav text-white/80 transition hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
            </svg>
            {IG_HANDLE}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {communityImages.map((img) => (
            <a
              key={img.src}
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-[4/5] overflow-hidden bg-[#151515]"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 16vw"
                className="object-cover transition-transform duration-[260ms] ease-out group-hover:scale-[1.05]"
              />
              <span className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/35" />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                aria-hidden="true"
              >
                <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
              </svg>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[44px] min-w-[200px] items-center justify-center border border-white/30 px-6 text-[11px] font-semibold uppercase tracking-label text-white transition hover:bg-white hover:text-black"
          >
            Follow Us On Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
