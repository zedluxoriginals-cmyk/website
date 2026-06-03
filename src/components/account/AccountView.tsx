"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/data/types";
import type { AccountProfile, AccountOrder, AccountAddress } from "@/lib/api/account";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import ProductGrid from "@/components/ProductGrid";
import { formatCents } from "@/lib/money";
import { addAddress, deleteAddress, setDefaultAddress } from "@/app/account/addresses/actions";

type Tab = "overview" | "orders" | "wishlist" | "addresses";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "orders", label: "Orders" },
  { key: "wishlist", label: "Wishlist" },
  { key: "addresses", label: "Addresses" },
];

const inputCls =
  "h-[42px] w-full border border-[#303030] bg-[#090909] px-3 text-[12px] text-white placeholder:text-soft-muted focus:border-white focus:outline-none";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function naira(n: number) {
  return formatCents(Math.round(n * 100));
}

function orderStatusLabel(s: string) {
  const map: Record<string, string> = {
    draft: "Draft", pending_payment: "Awaiting payment", paid: "Paid",
    processing: "Processing", fulfilled: "Fulfilled", cancelled: "Cancelled", refunded: "Refunded",
  };
  return map[s] ?? s.replace(/_/g, " ");
}

function statusColor(s: string) {
  if (["fulfilled", "paid"].includes(s)) return "text-emerald-400";
  if (["cancelled", "failed", "refunded"].includes(s)) return "text-red-400";
  if (["processing", "pending", "pending_payment"].includes(s)) return "text-amber-400";
  return "text-muted";
}

export default function AccountView({
  catalogue,
  profile,
  orders,
  addresses,
}: {
  catalogue: Product[];
  profile: AccountProfile;
  orders: AccountOrder[];
  addresses: AccountAddress[];
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [showAddForm, setShowAddForm] = useState(false);
  const { wishlist, hydrated } = useWishlist();

  const bySlug = new Map(catalogue.map((p) => [p.slug, p]));
  const wishlistProducts = hydrated
    ? wishlist.map((s) => bySlug.get(s)).filter((p): p is Product => Boolean(p))
    : [];

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside>
        <div className="border border-line bg-ink p-5">
          <p className="text-[11px] uppercase tracking-label text-soft-muted">Signed in as</p>
          <p className="mt-1 text-[14px] text-white">{profile.fullName || "ZEDLUXE Member"}</p>
          <p className="text-[12px] text-muted">{profile.email}</p>
        </div>
        <nav className="mt-4 flex flex-col" aria-label="Account sections">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => { setTab(t.key); setShowAddForm(false); }}
              aria-current={tab === t.key}
              className={`border-b border-line py-3.5 text-left text-[12px] font-semibold uppercase tracking-label transition ${
                tab === t.key ? "text-white" : "text-muted hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div>
        {/* Overview */}
        {tab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Orders" value={String(orders.length)} />
            <Stat label="Wishlist" value={hydrated ? String(wishlist.length) : "—"} />
            <Stat label="Saved Addresses" value={String(addresses.length)} />
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && (
          orders.length > 0 ? (
            <div className="border border-line">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 border-b border-line bg-ink px-5 py-3 text-[10px] font-semibold uppercase tracking-label text-soft-muted">
                <span>Order</span>
                <span>Date</span>
                <span>Status</span>
                <span className="text-right">Total</span>
              </div>
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/account/orders/${o.id}`}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-3 border-b border-line px-5 py-4 text-[12px] text-muted transition last:border-b-0 hover:bg-ink"
                >
                  <span className="text-white">{o.orderNumber}</span>
                  <span>{formatDate(o.placedAt)}</span>
                  <span className={`font-semibold ${statusColor(o.status)}`}>
                    {orderStatusLabel(o.status)}
                  </span>
                  <span className="text-right text-white">{naira(o.grandTotal)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-line bg-ink p-10 text-center">
              <p className="text-[14px] text-white">No orders yet.</p>
              <p className="mt-2 text-[13px] text-muted">Your orders will appear here once you&apos;ve placed one.</p>
              <Link href="/shop" className="mt-5 inline-flex bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white">
                Start shopping
              </Link>
            </div>
          )
        )}

        {/* Wishlist */}
        {tab === "wishlist" && (
          !hydrated ? (
            <p className="text-[13px] text-muted">Loading…</p>
          ) : wishlistProducts.length > 0 ? (
            <ProductGrid products={wishlistProducts} />
          ) : (
            <div className="border border-line bg-ink p-10 text-center">
              <p className="text-[14px] text-white">Your wishlist is empty.</p>
              <p className="mt-2 text-[13px] text-muted">Tap the heart on any product to save it here.</p>
              <Link href="/shop" className="mt-5 inline-flex bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white">
                Shop all
              </Link>
            </div>
          )
        )}

        {/* Addresses */}
        {tab === "addresses" && (
          <div className="space-y-4">
            {addresses.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((a) => (
                  <div key={a.id} className={`border bg-ink p-5 ${a.isDefaultShipping ? "border-white/30" : "border-line"}`}>
                    {a.isDefaultShipping && (
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-label text-white">Default</p>
                    )}
                    {a.label && <p className="mb-1 text-[10px] uppercase tracking-label text-soft-muted">{a.label}</p>}
                    <address className="text-[12px] not-italic leading-relaxed text-muted">
                      <span className="text-white">{a.fullName}</span><br />
                      {a.line1}<br />
                      {a.line2 && <>{a.line2}<br /></>}
                      {[a.city, a.state].filter(Boolean).join(", ")}<br />
                      {a.country}
                      {a.phone && <><br />{a.phone}</>}
                    </address>
                    <div className="mt-4 flex gap-4">
                      {!a.isDefaultShipping && (
                        <form action={setDefaultAddress}>
                          <input type="hidden" name="address_id" value={a.id} />
                          <button className="text-[10px] font-semibold uppercase tracking-label text-muted transition hover:text-white">
                            Set as default
                          </button>
                        </form>
                      )}
                      <form action={deleteAddress}>
                        <input type="hidden" name="address_id" value={a.id} />
                        <button className="text-[10px] font-semibold uppercase tracking-label text-red-400 transition hover:opacity-70">
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add address */}
            {!showAddForm ? (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="border border-dashed border-line px-5 py-4 text-[11px] font-semibold uppercase tracking-label text-muted transition hover:border-white/40 hover:text-white"
              >
                + Add new address
              </button>
            ) : (
              <form action={addAddress} onSubmit={() => setShowAddForm(false)} className="border border-line bg-ink p-5">
                <p className="mb-4 text-[12px] font-semibold uppercase tracking-label text-white">New address</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-[9px] font-semibold uppercase tracking-label text-soft-muted">Full name *</span>
                    <input name="full_name" required placeholder="As on package" className={inputCls} />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-[9px] font-semibold uppercase tracking-label text-soft-muted">Address line 1 *</span>
                    <input name="line1" required placeholder="Street address" className={inputCls} />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-[9px] font-semibold uppercase tracking-label text-soft-muted">Address line 2</span>
                    <input name="line2" placeholder="Apartment, floor (optional)" className={inputCls} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[9px] font-semibold uppercase tracking-label text-soft-muted">City *</span>
                    <input name="city" required placeholder="Lagos" className={inputCls} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[9px] font-semibold uppercase tracking-label text-soft-muted">State</span>
                    <input name="state" placeholder="Lagos State" className={inputCls} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[9px] font-semibold uppercase tracking-label text-soft-muted">Phone</span>
                    <input name="phone" type="tel" placeholder="+234..." className={inputCls} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[9px] font-semibold uppercase tracking-label text-soft-muted">Label (optional)</span>
                    <input name="label" placeholder="Home, Office…" className={inputCls} />
                  </label>
                </div>
                <label className="mt-3 flex items-center gap-2.5 text-[11px] text-muted">
                  <input name="is_default" type="checkbox" className="h-4 w-4 accent-white" />
                  Make this my default address
                </label>
                <div className="mt-4 flex gap-3">
                  <button type="submit" className="bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white">
                    Save address
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="border border-line px-5 py-2.5 text-[11px] font-semibold uppercase tracking-label text-muted transition hover:text-white">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {addresses.length === 0 && !showAddForm && (
              <p className="text-[13px] text-soft-muted">
                Addresses you save will appear here for faster checkout.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-ink p-6">
      <p className="text-[11px] uppercase tracking-label text-soft-muted">{label}</p>
      <p className="mt-2 font-serif text-[32px] text-white">{value}</p>
    </div>
  );
}
