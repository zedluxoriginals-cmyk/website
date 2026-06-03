import type { Metadata } from "next";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import {
  getDashboardStats,
  getLowStockItems,
  getRecentActivity,
} from "@/lib/admin/dashboard";
import { naira, timeAgo } from "@/lib/admin/format";
import { describeActivity } from "@/lib/admin/activity-labels";

export const metadata: Metadata = { title: "Store Control" };

export default async function AdminPage() {
  const [admin, stats, lowStock, activity] = await Promise.all([
    requireAdmin(),
    getDashboardStats(),
    getLowStockItems(6),
    getRecentActivity(8),
  ]);

  const sales = [
    { label: "Today", value: naira(stats.revenueToday) },
    { label: "Last 7 days", value: naira(stats.revenue7) },
    { label: "Last 30 days", value: naira(stats.revenue30) },
    { label: "Avg. order", value: naira(stats.averageOrderValue) },
  ];

  const ops = [
    { label: "Open orders", value: stats.openOrders, href: "/admin/orders" },
    { label: "Awaiting payment", value: stats.pendingPayments, href: "/admin/orders" },
    { label: "Active products", value: stats.activeProducts, href: "/admin/products" },
    { label: "Low stock", value: stats.lowStockCount, href: "/admin/products", alert: stats.lowStockCount > 0 },
    { label: "New messages", value: stats.unreadMessages, href: "/admin/inbox", alert: stats.unreadMessages > 0 },
    { label: "Subscribers", value: stats.subscribers, href: "/admin/inbox" },
  ];

  return (
    <AdminShell
      admin={admin}
      title="Store Control"
      actions={
        <>
          <QuickAction href="/admin/products/new" label="Add product" primary />
          <QuickAction href="/admin/orders" label="View orders" />
          <QuickAction href="/admin/homepage" label="Edit homepage" />
        </>
      }
    >
      {/* Sales */}
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-label text-soft-muted">
        Sales (paid orders)
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sales.map((card) => (
          <div key={card.label} className="border border-line bg-ink p-5">
            <p className="text-[10px] font-semibold uppercase tracking-label text-soft-muted">
              {card.label}
            </p>
            <p className="mt-3 font-serif text-[30px] leading-none text-white">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Operations */}
      <p className="mb-3 mt-9 text-[10px] font-semibold uppercase tracking-label text-soft-muted">
        Operations
      </p>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
        {ops.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`border bg-ink p-4 transition hover:border-white/40 ${
              card.alert ? "border-amber-500/40" : "border-line"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-label text-soft-muted">
              {card.label}
            </p>
            <p
              className={`mt-2 font-serif text-[28px] leading-none ${
                card.alert ? "text-amber-400" : "text-white"
              }`}
            >
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-9 grid gap-8 lg:grid-cols-2">
        {/* Low stock */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-label text-soft-muted">
              Needs restock
            </p>
            <Link href="/admin/products" className="text-[10px] uppercase tracking-label text-muted hover:text-white">
              All products →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <EmptyNote>Stock looks healthy. Nothing needs restocking.</EmptyNote>
          ) : (
            <ul className="divide-y divide-line border border-line">
              {lowStock.map((item) => (
                <li key={`${item.productId}-${item.variantLabel}`}>
                  <Link
                    href={`/admin/products/${item.productId}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-ink"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold text-white">
                        {item.productTitle}
                      </span>
                      <span className="block truncate text-[11px] text-soft-muted">
                        {item.variantLabel}
                      </span>
                    </span>
                    <span className="shrink-0 text-[12px] font-semibold text-amber-400">
                      {item.stock} left
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent activity */}
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-label text-soft-muted">
            Recent activity
          </p>
          {activity.length === 0 ? (
            <EmptyNote>No changes recorded yet.</EmptyNote>
          ) : (
            <ul className="divide-y divide-line border border-line">
              {activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="min-w-0 text-[12px] text-off-white">
                    {describeActivity(a.action, a.metadata)}
                    {a.actorName ? (
                      <span className="text-soft-muted"> · {a.actorName}</span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-[11px] text-soft-muted">
                    {timeAgo(a.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function QuickAction({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-label transition ${
        primary
          ? "bg-white text-black hover:bg-off-white"
          : "border border-line text-white hover:border-white/50"
      }`}
    >
      {label}
    </Link>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-line px-4 py-6 text-[12px] text-soft-muted">
      {children}
    </div>
  );
}
