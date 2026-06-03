import Image from "next/image";
import Link from "next/link";

export default function CampaignBanner() {
  return (
    <section className="relative min-h-[320px] overflow-hidden border border-[#303030]">
      <Image
        src="/assets/batch-1/shop/shop-featured-campaign-wide.png"
        alt=""
        fill
        sizes="(max-width: 1280px) 100vw, 1280px"
        className="object-cover object-[center_right]"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.62) 45%, rgba(0,0,0,0.18) 100%)",
        }}
      />
      <div className="relative flex min-h-[320px] flex-col justify-center px-8 py-14 md:px-16">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Summer &apos;24 Campaign
        </p>
        <h2 className="mt-4 font-serif text-[40px] font-normal leading-[0.95] text-white md:text-[52px]">
          Own Your
          <br />
          Standard.
        </h2>
        <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-[#d4d4d4]">
          A collection built for movement, rooted in purpose.
        </p>
        <div className="mt-7">
          <Link
            href="/collections/outerwear"
            className="inline-flex h-11 items-center justify-center border border-white bg-white px-6 text-[11px] font-bold uppercase tracking-nav text-black transition hover:bg-off-white"
          >
            Explore The Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
