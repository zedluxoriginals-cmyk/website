import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import StatusBadge, {
  orderTone,
  orderLabel,
  paymentTone,
  paymentLabel,
} from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminOrder, MANUAL_ORDER_STATUSES } from "@/lib/admin/orders";
import { updateOrderStatus, updateOrderTracking } from "@/app/admin/orders/actions";
import { naira, dateTime } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Order" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [admin, order] = await Promise.all([requireAdmin(), getAdminOrder(id)]);
  if (!order) notFound();

  const address = order.shippingAddress ?? {};
  const addressLines = [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(", "),
    address.country,
  ].filter((l) => typeof l === "string" && l.length > 0) as string[];

  return (
    <AdminShell
      admin={admin}
      title={order.orderNumber}
      eyebrow="Store Control / Orders"
      actions={
        <Link
          href="/admin/orders"
          className="border border-line px-4 py-2.5 text-[11px] font-semibold uppercase tracking-label text-white transition hover:border-white/50"
        >
          ← All orders
        </Link>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge label={orderLabel(order.status)} tone={orderTone(order.status)} />
        <StatusBadge label={`Payment: ${paymentLabel(order.paymentStatus)}`} tone={paymentTone(order.paymentStatus)} />
        <span className="text-[11px] text-soft-muted">Placed {dateTime(order.placedAt)}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Items + totals */}
        <section className="space-y-6">
          <div className="border border-line">
            <p className="border-b border-line bg-ink px-4 py-3 text-[10px] font-semibold uppercase tracking-label text-soft-muted">
              Items
            </p>
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-4 py-4">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-charcoal-2">
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.productTitle} fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">{item.productTitle}</p>
                    <p className="text-[11px] text-soft-muted">
                      {item.variantTitle ?? "—"}
                      {item.sku ? ` · ${item.sku}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-[12px] text-muted">
                    <p>
                      {item.quantity} × {naira(item.unitPrice)}
                    </p>
                    <p className="text-white">{naira(item.lineTotal)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-line bg-ink px-4 py-4">
            <Row label="Subtotal" value={naira(order.subtotal)} />
            <Row label="Shipping" value={naira(order.shippingTotal)} />
            {order.discountTotal > 0 && <Row label="Discount" value={`− ${naira(order.discountTotal)}`} />}
            <div className="mt-2 border-t border-line pt-2">
              <Row label="Total" value={naira(order.grandTotal)} strong />
            </div>
          </div>
        </section>

        {/* Customer + actions */}
        <aside className="space-y-5">
          <div className="border border-line bg-ink p-5">
            <p className="text-[10px] font-semibold uppercase tracking-label text-soft-muted">Customer</p>
            <p className="mt-2 text-[13px] text-white">{order.email}</p>
            {order.phone && <p className="text-[12px] text-muted">{order.phone}</p>}
            {addressLines.length > 0 && (
              <div className="mt-3 space-y-0.5 text-[12px] text-muted">
                {addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            )}
          </div>

          {/* Fulfillment status — manual statuses only; payment is webhook-owned */}
          <form action={updateOrderStatus} className="border border-line bg-ink p-5">
            <input type="hidden" name="order_id" value={order.id} />
            <p className="text-[10px] font-semibold uppercase tracking-label text-soft-muted">Update status</p>
            <select
              name="status"
              defaultValue={MANUAL_ORDER_STATUSES.includes(order.status) ? order.status : "processing"}
              className="mt-2 h-[44px] w-full border border-[#303030] bg-[#090909] px-3 text-[13px] text-white focus:border-white focus:outline-none"
            >
              {MANUAL_ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {orderLabel(s)}
                </option>
              ))}
            </select>
            <button className="mt-3 w-full bg-white py-3 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white">
              Save status
            </button>
            <p className="mt-2 text-[10px] leading-relaxed text-soft-muted">
              Paid &amp; refunded states are set automatically by the payment system.
            </p>
          </form>

          {/* Tracking + notes */}
          <form action={updateOrderTracking} className="space-y-3 border border-line bg-ink p-5">
            <input type="hidden" name="order_id" value={order.id} />
            <p className="text-[10px] font-semibold uppercase tracking-label text-soft-muted">Delivery tracking</p>
            <input
              name="tracking_number"
              defaultValue={order.trackingNumber ?? ""}
              placeholder="Tracking number"
              className={inputCls}
            />
            <input
              name="tracking_url"
              defaultValue={order.trackingUrl ?? ""}
              placeholder="Tracking link"
              className={inputCls}
            />
            <textarea
              name="notes"
              defaultValue={order.notes ?? ""}
              rows={3}
              placeholder="Internal note (not shown to customer)"
              className="w-full border border-[#303030] bg-[#090909] px-3 py-2.5 text-[13px] text-white placeholder:text-soft-muted focus:border-white focus:outline-none"
            />
            <button className="w-full border border-line py-3 text-[11px] font-semibold uppercase tracking-label text-white transition hover:border-white/50">
              Save tracking
            </button>
          </form>
        </aside>
      </div>
    </AdminShell>
  );
}

const inputCls =
  "h-[44px] w-full border border-[#303030] bg-[#090909] px-3 text-[13px] text-white placeholder:text-soft-muted focus:border-white focus:outline-none";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 text-[12px]">
      <span className="text-soft-muted">{label}</span>
      <span className={strong ? "text-[15px] font-semibold text-white" : "text-muted"}>{value}</span>
    </div>
  );
}
