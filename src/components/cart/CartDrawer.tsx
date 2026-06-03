"use client";

/*
  Slide-in cart, mounted once at the layout level and toggled via the cart
  context. Opening is triggered from the header bag button and from
  "Add to bag" on the PDP. Quantity edits / removal reuse the same context
  actions the full /cart page uses.
*/

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { formatCents } from "@/lib/money";
import { CloseIcon } from "../icons";

export default function CartDrawer() {
  const {
    drawerOpen,
    closeDrawer,
    lines,
    count,
    subtotalCents,
    setQuantity,
    removeItem,
  } = useCart();

  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll, close on Escape, and move focus into the dialog.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    // Send keyboard focus to the close button when the drawer opens.
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <div
      aria-hidden={!drawerOpen}
      className={`fixed inset-0 z-[60] ${
        drawerOpen ? "" : "pointer-events-none"
      }`}
    >
      {/* Scrim */}
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeDrawer}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-ink shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-white">
            Your Bag ({count})
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="-mr-2 p-2 text-white transition hover:opacity-70"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-[13px] text-muted">Your bag is empty.</p>
            <Link
              href="/shop"
              onClick={closeDrawer}
              className="bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-4 py-5">
                  <Link
                    href={`/products/${line.slug}`}
                    onClick={closeDrawer}
                    className="relative h-[88px] w-[72px] shrink-0 overflow-hidden bg-charcoal-2"
                  >
                    <Image
                      src={line.image}
                      alt={line.title}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[11px] font-semibold uppercase tracking-label text-white">
                        {line.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeItem(line.key)}
                        aria-label={`Remove ${line.title}`}
                        className="text-muted transition hover:text-white"
                      >
                        <CloseIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] text-soft-muted">
                      {line.size} · {line.color}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QtyStepper
                        value={line.quantity}
                        onChange={(q) => setQuantity(line.key, q)}
                      />
                      <span className="text-[12px] text-white">
                        {formatCents(line.priceCents * line.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-label text-muted">
                  Subtotal
                </span>
                <span className="text-[14px] font-semibold text-white">
                  {formatCents(subtotalCents)}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-soft-muted">
                Shipping &amp; taxes calculated at checkout.
              </p>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="mt-4 block bg-white py-3.5 text-center text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white"
              >
                View Bag &amp; Checkout
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

export function QtyStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (q: number) => void;
}) {
  return (
    <div className="inline-flex items-center border border-line">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        aria-label="Decrease quantity"
        className="h-8 w-8 text-[15px] text-muted transition hover:text-white"
      >
        −
      </button>
      <span className="w-8 text-center text-[12px] text-white">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
        className="h-8 w-8 text-[15px] text-muted transition hover:text-white"
      >
        +
      </button>
    </div>
  );
}
