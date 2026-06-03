"use client";

import { useState } from "react";
import type { Product } from "@/data/types";
import { useCart } from "@/components/cart/CartProvider";
import { BagIcon } from "@/components/icons";

/*
  Transparent bag icon overlay — mirrors WishlistButton in position and style.
  - Single tap/click: if product has only one size + one color, adds immediately.
  - Otherwise: opens a small inline size/color picker, then adds on confirm.
  - Shows a brief filled/white state after adding as confirmation.
*/
export default function CartButton({ product }: { product: Product }) {
  const { addItem, openDrawer } = useCart();
  const [open, setOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const singleVariant = product.sizes.length <= 1 && product.colors.length <= 1;

  function doAdd() {
    const size = selectedSize ?? product.sizes[0] ?? "";
    const color = selectedColor ?? product.colors[0]?.name ?? "";
    addItem({ product, size, color, quantity: 1 });
    setAdded(true);
    setOpen(false);
    setSelectedSize(null);
    setSelectedColor(null);
    openDrawer();
    setTimeout(() => setAdded(false), 2000);
  }

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (singleVariant) {
      doAdd();
    } else {
      // Pre-select first size + color so Add to bag is ready immediately.
      if (!selectedSize && product.sizes.length > 0) setSelectedSize(product.sizes[0]);
      if (!selectedColor && product.colors.length > 0) setSelectedColor(product.colors[0].name);
      setOpen((o) => !o);
    }
  }

  return (
    <>
      {/* Bag icon — bottom-right, mirrors heart top-right */}
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Add ${product.title} to bag`}
        className="absolute bottom-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-[2px] transition hover:bg-black/60"
      >
        <BagIcon
          className={`h-4 w-4 transition-colors ${added ? "text-white" : "text-white/80"}`}
        />
      </button>

      {/* Inline size/color picker — slides up from the bottom of the image */}
      {open && (
        <div
          className="absolute inset-x-0 bottom-0 z-20 bg-black/85 px-3 py-3 backdrop-blur-sm"
          onClick={(e) => e.preventDefault()}
        >
          {product.sizes.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={(e) => { e.preventDefault(); setSelectedSize(s); }}
                  className={`border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-label transition ${
                    selectedSize === s
                      ? "border-white bg-white text-black"
                      : "border-white/30 text-white hover:border-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {product.colors.length > 0 && (
            <div className="mb-2.5 flex gap-1.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  onClick={(e) => { e.preventDefault(); setSelectedColor(c.name); }}
                  className={`h-4 w-4 rounded-full border-2 transition ${
                    selectedColor === c.name ? "border-white" : "border-transparent hover:border-white/50"
                  }`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          )}

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); doAdd(); }}
              disabled={
                (product.sizes.length > 0 && !selectedSize) ||
                (product.colors.length > 0 && !selectedColor)
              }
              className="flex-1 bg-white py-2 text-[9px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add to bag
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setOpen(false); }}
              className="border border-white/20 px-2.5 text-[11px] text-white/60 transition hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
