import Image from "next/image";
import { communityImages } from "@/data/site";

export default function CommunityStrip() {
  return (
    <section className="container-zed pt-5 pb-8">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-[12px] font-semibold uppercase tracking-nav text-white">
          @ZEDLUXE ORIGINALS
        </h2>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold uppercase tracking-nav text-muted transition hover:text-white"
        >
          Follow Us
        </a>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {communityImages.map((img) => (
          <a
            key={img.src}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-[4/3] overflow-hidden bg-[#151515]"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 16vw"
              className="object-cover transition-transform duration-[220ms] ease-out group-hover:scale-[1.04]"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
