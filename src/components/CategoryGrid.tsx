import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/data/types";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/collections/${cat.slug}`}
          className="group relative block aspect-[1/1.12] overflow-hidden bg-[#151515]"
        >
          <Image
            src={cat.image}
            alt={cat.title}
            fill
            sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 16vw"
            className="object-cover transition-transform duration-[220ms] ease-out group-hover:scale-[1.04]"
          />
          <span className="absolute inset-0 bg-black/[0.36]" aria-hidden="true" />
          <span className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-0.5 pb-5 text-center">
            <span className="text-[12px] font-semibold uppercase tracking-nav text-white">
              {cat.title}
            </span>
            <span className="text-[10px] uppercase tracking-label text-white/70">
              Shop Now
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
