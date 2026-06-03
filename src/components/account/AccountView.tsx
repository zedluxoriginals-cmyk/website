"use client";

/*
  Account dashboard. Logged-in only (the page redirects guests to /login).
  Reads REAL profile / orders / addresses from Supabase (passed as props) and
  the REAL wishlist from localStorage. Orders/addresses show empty states until
  the user has any — orders populate once checkout (Phase 8B) is live.
*/

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/data/types";
import type { AccountProfile, AccountOrder, AccountAddress } from "@/lib/api/account";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import ProductGrid from "@/components/ProductGrid";
import { formatCents } from "@/lib/money";

type Tab = "overview" | "orders" | "wishlist" | "addresses";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "orders", label: "Orders" },
  { key: "wishlist", label: "Wishlist" },
  { key: "addresses", label: "Addresses" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
          <p className="text-[11px] uppercase tracking-label text-soft-muted">
            Signed in as
          </p>
          <p className="mt-1 text-[14px] text-white">
            {profile.fullName || "ZEDLUXE Member"}
          </p>
          <p className="text-[12px] text-muted">{profile.email}</p>
        </div>
        <nav className="mt-4 flex flex-col" aria-label="Account sections">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
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
        {tab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Orders" value={String(orders.length)} />
            <Stat label="Wishlist" value={hydrated ? String(wishlist.length) : "—"} />
            <Stat label="Saved Addresses" value={String(addresses.length)} />
          </div>
        )}

        {tab === "orders" && (
          orders.length > 0 ? (
            <div className="border border-line">
              <div className="grid grid-cols-4 gap-2 border-b border-line bg-charcoal px-5 py-3 text-[10px] font-semibold uppercase tracking-label text-soft-muted">
                <span>Order</span>
                <span>Date</span>
                <span>Status</span>
                <span className="text-right">Total</span>
              </div>
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="grid grid-cols-4 gap-2 border-b border-line px-5 py-4 text-[12px] text-muted last:border-b-0"
                >
                  <span className="text-white">{o.orderNumber}</span>
                  <span>{formatDate(o.createdAt)}</span>
                  <span className="capitalize">{o.status.replace(/_/g, " ")}</span>
                  <span className="text-right text-white">
                    {formatCents(Math.round(o.grandTotal * 100))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-line bg-ink p-10 text-center">
              <p className="text-[14px] text-white">No orders yet.</p>
              <p className="mt-2 text-[13px] text-muted">
                Your orders will appear here once you’ve placed one.
              </p>
              <Link
                href="/shop"
                className="mt-5 inline-flex bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white"
              >
                Start Shopping
              </Link>
            </div>
          )
        )}

        {tab === "wishlist" && (
          <div>
            {!hydrated ? (
              <p className="text-[13px] text-muted">Loading…</p>
            ) : wishlistProducts.length > 0 ? (
              <ProductGrid products={wishlistProducts} />
            ) : (
              <div className="border border-line bg-ink p-10 text-center">
                <p className="text-[14px] text-white">Your wishlist is empty.</p>
                <p className="mt-2 text-[13px] text-muted">
                  Tap the heart on any product to save it here.
                </p>
                <Link
                  href="/shop"
                  className="mt-5 inline-flex bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white"
                >
                  Shop All
                </Link>
              </div>
            )}
          </div>
        )}

        {tab === "addresses" && (
          addresses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {addresses.map((a) => (
                <div key={a.id} className="border border-line bg-ink p-6">
                  <address className="text-[13px] not-italic leading-relaxed text-muted">
                    <span className="text-white">{a.fullName}</span>
                    <br />
                    {a.line1}
                    {a.line2 && (<><br />{a.line2}</>)}
                    <br />
                    {[a.city, a.state].filter(Boolean).join(", ")}
                    <br />
                    {a.country}
                  </address>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-line bg-ink p-10 text-center">
              <p className="text-[14px] text-white">No saved addresses.</p>
              <p className="mt-2 text-[13px] text-muted">
                An address is saved automatically when you place your first order.
              </p>
            </div>
          )
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
