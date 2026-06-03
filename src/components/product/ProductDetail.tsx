"use client";

/*
  Product detail interaction surface. Holds the gallery + size/color/qty
  selection and the "Add to bag" action. Size is required before adding
  (caps/bags are "One Size" so they're auto-valid). On add we open the
  cart drawer for immediate feedback.
*/

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/types";
import { useCart } from "@/components/cart/CartProvider";
import { QtyStepper } from "@/components/cart/CartDrawer";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import WishlistButton from "@/components/wishlist/WishlistButton";

export default function ProductDetail({ product }: { product: Product }) {
  const { addItem, openDrawer } = useCart();
  const { recordView } = useWishlist();

  // Log this product as recently viewed (client-only, after mount).
  useEffect(() => {
    recordView(product.slug);
  }, [product.slug, recordView]);

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string>(
    product.sizes.length === 1 ? product.sizes[0] : "",
  );
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    if (!size) {
      setError("Please select a size.");
      return;
    }
    setError(null);
    addItem({ product, size, color, quantity });
    openDrawer();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Gallery */}
      <div>
        <div className="relative aspect-[1/1.18] overflow-hidden bg-charcoal-2">
          <Image
            src={product.images[activeImage]}
            alt={product.title}
            fill
            sizes="(max-width: 1023px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        </div>
        {product.images.length > 1 && (
          <div className="mt-3 flex gap-3">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={i === activeImage}
                className={`relative h-[88px] w-[72px] overflow-hidden bg-charcoal-2 transition ${
                  i === activeImage ? "ring-1 ring-white" : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={src} alt="" fill sizes="72px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="lg:pt-2">
        <Link
          href={`/collections/${product.category}`}
          className="eyebrow text-[11px] text-muted transition hover:text-white"
        >
          {product.category}
        </Link>
        <h1 className="mt-2 font-serif text-[34px] leading-tight text-white md:text-[42px]">
          {product.title}
        </h1>
        <p className="mt-3 text-[16px] text-off-white">{product.price}</p>

        <p className="mt-6 max-w-prose text-[13px] leading-relaxed text-muted">
          {product.description}
        </p>

        {/* Color */}
        {product.colors.length > 0 && (
          <div className="mt-8">
            <p className="text-[11px] uppercase tracking-label text-soft-muted">
              Color: <span className="text-white">{color}</span>
            </p>
            <div className="mt-3 flex gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={color === c.name}
                  className={`h-7 w-7 rounded-full border transition ${
                    color === c.name
                      ? "border-white ring-1 ring-white ring-offset-2 ring-offset-black"
                      : "border-white/20 hover:border-white/50"
                  }`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size */}
        <div className="mt-7">
          <p className="text-[11px] uppercase tracking-label text-soft-muted">Size</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSize(s);
                  setError(null);
                }}
                aria-pressed={size === s}
                className={`min-w-[48px] border px-3 py-2.5 text-[11px] font-semibold uppercase tracking-label transition ${
                  size === s
                    ? "border-white bg-white text-black"
                    : "border-line text-muted hover:border-white/40 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {error && <p className="mt-2 text-[11px] text-red-400">{error}</p>}
        </div>

        {/* Qty + add */}
        <div className="mt-8 flex items-center gap-3">
          <QtyStepper value={quantity} onChange={(q) => setQuantity(Math.max(1, q))} />
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 bg-white py-3.5 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white"
          >
            Add to Bag
          </button>
          <WishlistButton slug={product.slug} variant="inline" />
        </div>
      </div>
    </div>
  );
}
