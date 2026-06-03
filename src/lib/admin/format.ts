/*
  Admin-side display helpers. DB money columns (base_price, grand_total,
  order_item totals) are stored in WHOLE Naira — not kobo — so admin screens
  format them directly. (The storefront cart uses kobo via src/lib/money.ts;
  don't mix the two.)
*/

export function naira(amount: number | null | undefined): string {
  return `₦${Number(amount ?? 0).toLocaleString("en-NG")}`;
}

/** Short date like "3 Jun 2026". */
export function shortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Date + time like "3 Jun, 2:14 PM". */
export function dateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "2 hours ago" style relative time for activity feeds. */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return shortDate(iso);
}
