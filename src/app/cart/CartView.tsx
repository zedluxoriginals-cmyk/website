"use client";

/*
  Full cart page view. Mirrors the drawer but with room to breathe and an
  order-summary column. Checkout is a placeholder in Phase 3 — the real
  flow (server-recalculated totals + Paystack) lands in Phase 8, so the
  button only signals intent for now and never computes a payable total
  the client could tamper with.
*/

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { QtyStepper } from "@/components/cart/CartDrawer";
import { formatCents } from "@/lib/money";
import { CloseIcon } from "@/components/icons";

export default function CartView() {
  const { lines, count, subtotalCents, hydrated, setQuantity, removeItem } =
    useCart();

  // Until localStorage has loaded, render nothing cart-specific to avoid a
  // hydration mismatch (server always renders an empty cart).
  if (!hydrated) {
    return <p className="py-20 text-center text-[13px] text-muted">Loading your bag…</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-24 text-center">
        <p className="font-serif text-[28px] text-white">Your bag is empty</p>
        <p className="max-w-sm text-[13px] text-muted">
          Looks like you haven&apos;t added anything yet. Explore the collection.
        </p>
        <Link
          href="/shop"
          className="bg-white px-8 py-3.5 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white"
        >
          Shop All
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* Line items */}
      <ul className="divide-y divide-line border-y border-line">
        {lines.map((line) => (
          <li key={line.key} className="flex gap-5 py-6">
            <Link
              href={`/products/${line.slug}`}
              className="relative h-[132px] w-[108px] shrink-0 overflow-hidden bg-charcoal-2"
            >
              <Image
                src={line.image}
                alt={line.title}
                fill
                sizes="108px"
                className="object-cover"
              />
            </Link>

            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/products/${line.slug}`}
                    className="text-[12px] font-semibold uppercase tracking-label text-white transition hover:opacity-70"
                  >
                    {line.title}
                  </Link>
                  <p className="mt-1.5 text-[11px] text-soft-muted">
                    {line.size} · {line.color}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(line.key)}
                  aria-label={`Remove ${line.title}`}
                  className="text-muted transition hover:text-white"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-auto flex items-end justify-between pt-4">
                <QtyStepper
                  value={line.quantity}
                  onChange={(q) => setQuantity(line.key, q)}
                />
                <span className="text-[13px] text-white">
                  {formatCents(line.priceCents * line.quantity)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Summary */}
      <aside className="h-fit border border-line bg-ink p-6 lg:sticky lg:top-24">
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-white">
          Order Summary
        </h2>
        <dl className="mt-5 space-y-3 text-[12px]">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal ({count} items)</dt>
            <dd className="text-white">{formatCents(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd className="text-soft-muted">Calculated at checkout</dd>
          </div>
        </dl>
        <div className="mt-5 flex justify-between border-t border-line pt-4">
          <span className="text-[12px] uppercase tracking-label text-white">Total</span>
          <span className="text-[15px] font-semibold text-white">
            {formatCents(subtotalCents)}
          </span>
        </div>

        <button
          type="button"
          disabled
          title="Checkout opens once payments are connected (Phase 8)."
          className="mt-6 w-full cursor-not-allowed bg-white/90 py-3.5 text-[11px] font-semibold uppercase tracking-label text-black opacity-80"
        >
          Checkout
        </button>
        <p className="mt-2 text-center text-[10px] text-soft-muted">
          Secure checkout coming soon.
        </p>

        <Link
          href="/shop"
          className="mt-4 block text-center text-[11px] uppercase tracking-label text-muted transition hover:text-white"
        >
          Continue Shopping
        </Link>
      </aside>
    </div>
  );
}
