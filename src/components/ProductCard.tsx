import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/types";
import WishlistButton from "./wishlist/WishlistButton";
import CartButton from "./CartButton";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[1/1.18] overflow-hidden bg-charcoal-2"
      >
        {product.badge && (
          <span className="absolute left-2 top-2 z-10 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-label text-black">
            {product.badge}
          </span>
        )}
        <WishlistButton slug={product.slug} />
        <CartButton product={product} />
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 16vw"
          className="object-cover transition-transform duration-[220ms] ease-out group-hover:scale-[1.03]"
        />
      </Link>

      <div className="mt-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-label text-white">
          {product.title}
        </h3>
        <p className="mt-1 text-[12px] text-muted">{product.price}</p>
        <ul
          className="mt-2 flex gap-1.5"
          aria-label={`Colors: ${product.colors.map((c) => c.name).join(", ")}`}
        >
          {product.colors.map((c) => (
            <li
              key={c.name}
              title={c.name}
              className="h-2.5 w-2.5 rounded-full border border-white/20"
              style={{ background: c.hex }}
            />
          ))}
        </ul>
      </div>
    </article>
  );
}
