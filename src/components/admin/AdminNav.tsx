"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  { label: "Overview", href: "/admin" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Catalog", href: "/admin/products" },
  { label: "Homepage", href: "/admin/homepage" },
  { label: "Inbox", href: "/admin/inbox" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Store sections"
      className="mt-5 flex gap-2 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden"
    >
      {sections.map((s) => {
        const active =
          s.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(s.href);
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 border px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-label transition lg:border-l-2 lg:border-y-0 lg:border-r-0 ${
              active
                ? "border-white bg-white text-black lg:bg-transparent lg:text-white"
                : "border-line text-muted hover:border-white/40 hover:text-white lg:border-transparent"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
