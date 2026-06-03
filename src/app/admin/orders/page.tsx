import type { Metadata } from "next";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import StatusBadge, {
  orderTone,
  orderLabel,
  paymentTone,
  paymentLabel,
} from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminOrders } from "@/lib/admin/orders";
import { naira, shortDate } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const [admin, orders] = await Promise.all([requireAdmin(), getAdminOrders()]);

  return (
    <AdminShell admin={admin} title="Orders" eyebrow="Store Control">
      {orders.length === 0 ? (
        <div className="border border-dashed border-line px-6 py-16 text-center text-[13px] text-soft-muted">
          No orders yet. They&rsquo;ll appear here as soon as customers check out.
        </div>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-ink">
              <tr className="text-[10px] uppercase tracking-label text-soft-muted">
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-black">
              {orders.map((o) => (
                <tr key={o.id} className="transition hover:bg-ink">
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-[12px] font-semibold uppercase tracking-label text-white hover:opacity-70"
                    >
                      {o.orderNumber}
                    </Link>
                    <p className="mt-1 text-[11px] text-soft-muted">
                      {o.itemCount} item{o.itemCount === 1 ? "" : "s"}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-[12px] text-muted">{o.email}</td>
                  <td className="px-4 py-4 text-[12px] text-white">{naira(o.grandTotal)}</td>
                  <td className="px-4 py-4">
                    <StatusBadge label={paymentLabel(o.paymentStatus)} tone={paymentTone(o.paymentStatus)} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge label={orderLabel(o.status)} tone={orderTone(o.status)} />
                  </td>
                  <td className="px-4 py-4 text-[12px] text-soft-muted">{shortDate(o.placedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
