import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { formatCents } from "@/lib/money";

export const metadata: Metadata = { title: "Order details" };

function naira(n: number) {
  return formatCents(Math.round(n * 100));
}

function orderStatusLabel(s: string) {
  const map: Record<string, string> = {
    draft: "Draft", pending_payment: "Awaiting payment", paid: "Paid",
    processing: "Processing", fulfilled: "Fulfilled", cancelled: "Cancelled", refunded: "Refunded",
  };
  return map[s] ?? s;
}

function paymentStatusLabel(s: string) {
  const map: Record<string, string> = {
    not_started: "Not started", pending: "Pending", paid: "Paid",
    failed: "Payment failed", refunded: "Refunded",
  };
  return map[s] ?? s;
}

function statusColor(s: string) {
  if (["fulfilled", "paid"].includes(s)) return "text-emerald-400";
  if (["cancelled", "failed", "refunded"].includes(s)) return "text-red-400";
  if (["processing", "pending", "pending_payment"].includes(s)) return "text-amber-400";
  return "text-muted";
}

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status, payment_status, grand_total, subtotal, shipping_total, discount_total, currency, tracking_number, tracking_url, notes, placed_at, created_at, shipping_address, order_items(id, product_title, variant_title, quantity, unit_price, line_total, image_url, product_id)")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) notFound();

  const address = (order.shipping_address ?? {}) as Record<string, string>;
  const addressLines = [
    address.full_name,
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(", "),
    address.country,
  ].filter(Boolean);

  return (
    <>
      <Header variant="solid" />
      <main className="container-zed pb-16 pt-10">
        <div className="mb-6">
          <Link
            href="/account"
            className="text-[11px] font-semibold uppercase tracking-label text-muted transition hover:text-white"
          >
            ← My account
          </Link>
        </div>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-[11px] text-muted">Order</p>
            <h1 className="mt-2 font-serif text-[36px] leading-none text-white">
              {order.order_number}
            </h1>
          </div>
          <div className="text-right">
            <p className={`text-[12px] font-semibold uppercase tracking-label ${statusColor(order.status)}`}>
              {orderStatusLabel(order.status)}
            </p>
            <p className="text-[11px] text-soft-muted">
              {new Date(order.placed_at ?? order.created_at).toLocaleDateString("en-NG", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Items */}
          <section>
            <div className="border border-line">
              <p className="border-b border-line bg-ink px-4 py-3 text-[10px] font-semibold uppercase tracking-label text-soft-muted">
                Items ordered
              </p>
              <ul className="divide-y divide-line">
                {order.order_items.map((item) => (
                  <li key={item.id} className="flex items-start gap-4 px-4 py-4">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-charcoal-2">
                      {item.image_url && (
                        <Image src={item.image_url} alt={item.product_title} fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-white">{item.product_title}</p>
                      {item.variant_title && (
                        <p className="text-[11px] text-soft-muted">{item.variant_title}</p>
                      )}
                      <p className="text-[11px] text-soft-muted">Qty {item.quantity}</p>
                    </div>
                    <p className="shrink-0 text-[12px] text-white">{naira(item.line_total)}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Totals */}
            <div className="mt-4 border border-line bg-ink px-4 py-4 text-[12px]">
              <div className="flex justify-between py-1">
                <span className="text-muted">Subtotal</span>
                <span className="text-white">{naira(order.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted">Shipping</span>
                <span className={order.shipping_total === 0 ? "text-emerald-400" : "text-white"}>
                  {order.shipping_total === 0 ? "Free" : naira(order.shipping_total)}
                </span>
              </div>
              {order.discount_total > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-muted">Discount</span>
                  <span className="text-white">− {naira(order.discount_total)}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-line pt-2">
                <span className="font-semibold uppercase tracking-label text-white">Total</span>
                <span className="text-[15px] font-semibold text-white">{naira(order.grand_total)}</span>
              </div>
            </div>
          </section>

          {/* Sidebar: status + delivery + tracking */}
          <aside className="space-y-5">
            <div className="border border-line bg-ink p-5">
              <p className="text-[10px] font-semibold uppercase tracking-label text-soft-muted">Payment</p>
              <p className={`mt-2 text-[13px] font-semibold ${statusColor(order.payment_status)}`}>
                {paymentStatusLabel(order.payment_status)}
              </p>
            </div>

            {addressLines.length > 0 && (
              <div className="border border-line bg-ink p-5">
                <p className="text-[10px] font-semibold uppercase tracking-label text-soft-muted">Delivery address</p>
                <div className="mt-2 space-y-0.5 text-[12px] text-muted">
                  {addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {order.tracking_number && (
              <div className="border border-line bg-ink p-5">
                <p className="text-[10px] font-semibold uppercase tracking-label text-soft-muted">Tracking</p>
                <p className="mt-2 text-[12px] text-white">{order.tracking_number}</p>
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-[11px] font-semibold uppercase tracking-label text-white transition hover:opacity-70"
                  >
                    Track delivery →
                  </a>
                )}
              </div>
            )}

            {order.notes && (
              <div className="border border-line bg-ink p-5">
                <p className="text-[10px] font-semibold uppercase tracking-label text-soft-muted">Note</p>
                <p className="mt-2 text-[12px] text-muted">{order.notes}</p>
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
