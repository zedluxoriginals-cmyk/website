import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[680px] md:min-h-[560px]">
      {/* Background image */}
      <Image
        src="/assets/batch-1/shop/shop-hero-wide.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_right]"
      />
      {/* Left-to-right dark gradient overlay (in CSS, not baked in) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.76) 32%, rgba(0,0,0,0.32) 66%, rgba(0,0,0,0.12) 100%)",
        }}
      />

      {/* Content */}
      <div className="container-zed relative flex min-h-[680px] flex-col justify-center pt-[140px] pb-12 md:min-h-[560px] md:pt-[150px] md:pb-0">
        <div className="max-w-[430px]">
          <h1 className="font-serif text-[clamp(44px,6vw,88px)] font-normal leading-[0.92] tracking-[-0.035em] text-white">
            Elevated
            <br />
            Essentials.
          </h1>
          <p className="mt-7 text-[15px] leading-[1.7] text-white">
            Quality. Culture. Confidence.
            <br />
            This is Zedluxe Originals.
          </p>
          <div className="mt-8">
            <Link
              href="/shop"
              className="inline-flex h-11 min-w-[150px] items-center justify-center border border-white bg-white px-6 text-[11px] font-bold uppercase tracking-nav text-black transition hover:bg-off-white"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
