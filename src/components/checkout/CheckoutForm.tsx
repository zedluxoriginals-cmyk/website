"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import { formatCents } from "@/lib/money";

/*
  Guest-first checkout form. Collects email, phone, and delivery address,
  then calls the server-side /api/checkout route which validates everything
  against the DB and returns a Paystack authorization URL. We redirect there.

  Logged-in users get the same form (no friction difference) since account
  is optional — buying never requires it.
*/

const FREE_SHIPPING_THRESHOLD_CENTS = 150_000 * 100; // ₦150k in kobo
const SHIPPING_COST_CENTS = 3_500 * 100;             // ₦3,500

type FieldProps = {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
};

function Field({ label, required, hint, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-label text-soft-muted">
        {label}{required ? " *" : ""}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-soft-muted">{hint}</span>}
    </label>
  );
}

const inputCls =
  "h-[46px] w-full border border-[#303030] bg-[#090909] px-3.5 text-[13px] text-white placeholder:text-soft-muted focus:border-white focus:outline-none";

export default function CheckoutForm() {
  const { lines, subtotalCents, hydrated, clear } = useCart();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingCents = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_COST_CENTS;
  const totalCents = subtotalCents + shippingCents;
  const freeShipping = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;

  if (!hydrated) {
    return <p className="py-20 text-center text-[13px] text-muted">Loading your bag…</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-[28px] text-white">Your bag is empty</p>
        <Link
          href="/shop"
          className="mt-6 inline-block bg-white px-8 py-3.5 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white"
        >
          Shop All
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          shippingAddress: { fullName, line1, line2: line2 || undefined, city, state, country: "Nigeria" },
          lines: lines.map((l) => ({
            productId: l.productId,
            size: l.size,
            color: l.color,
            quantity: l.quantity,
          })),
        }),
      });

      const json = await res.json() as { authorizationUrl?: string; error?: string };

      if (!res.ok || !json.authorizationUrl) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }

      // Clear cart before redirect — the order is created server-side.
      clear();
      window.location.href = json.authorizationUrl;
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left: contact + address */}
        <div className="space-y-8">
          <section>
            <h2 className="mb-5 text-[12px] font-semibold uppercase tracking-label text-white">
              Contact
            </h2>
            <div className="space-y-4">
              <Field label="Email address" required>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className={inputCls}
                />
              </Field>
              <Field label="Phone number" hint="For delivery updates (WhatsApp-friendly).">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 801 234 5678"
                  autoComplete="tel"
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="mb-5 text-[12px] font-semibold uppercase tracking-label text-white">
              Delivery address
            </h2>
            <div className="space-y-4">
              <Field label="Full name" required>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As it should appear on the package"
                  autoComplete="name"
                  className={inputCls}
                />
              </Field>
              <Field label="Address line 1" required>
                <input
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="Street address, estate, house number"
                  autoComplete="address-line1"
                  className={inputCls}
                />
              </Field>
              <Field label="Address line 2">
                <input
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="Apartment, suite, floor (optional)"
                  autoComplete="address-line2"
                  className={inputCls}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" required>
                  <input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lagos"
                    autoComplete="address-level2"
                    className={inputCls}
                  />
                </Field>
                <Field label="State">
                  <input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Lagos State"
                    autoComplete="address-level1"
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>
          </section>

          {error && (
            <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-[12px] text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-white py-4 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Processing…" : "Pay securely →"}
          </button>

          <p className="text-center text-[10px] leading-relaxed text-soft-muted">
            You will be redirected to Paystack to complete payment. Your order is
            only confirmed after payment succeeds.
          </p>
        </div>

        {/* Right: order summary */}
        <aside className="h-fit border border-line bg-ink p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-label text-white">
            Order summary
          </h2>
          <ul className="space-y-4 border-b border-line pb-4">
            {lines.map((line) => (
              <li key={line.key} className="flex items-start gap-3">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-charcoal-2">
                  <Image
                    src={line.image}
                    alt={line.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[12px] font-semibold text-white">{line.title}</p>
                  <p className="text-[11px] text-soft-muted">{line.size} · {line.color}</p>
                  <p className="text-[11px] text-soft-muted">Qty {line.quantity}</p>
                </div>
                <p className="shrink-0 text-[12px] text-white">
                  {formatCents(line.priceCents * line.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="text-white">{formatCents(subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span className={freeShipping ? "text-emerald-400" : "text-white"}>
                {freeShipping ? "Free" : formatCents(shippingCents)}
              </span>
            </div>
            {!freeShipping && (
              <p className="text-[10px] text-soft-muted">
                Add {formatCents(FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents)} more for free shipping.
              </p>
            )}
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4">
            <span className="text-[12px] uppercase tracking-label text-white">Total</span>
            <span className="text-[16px] font-semibold text-white">{formatCents(totalCents)}</span>
          </div>
        </aside>
      </div>
    </form>
  );
}
