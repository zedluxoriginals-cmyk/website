import Link from "next/link";
import type { Category } from "@/data/types";

/*
  Horizontal collection switcher shown on a single-collection page so users can
  jump straight to a sibling collection without backing out. Each collection is
  its own server route (/collections/<slug>), so these are navigation links —
  the active one is highlighted. "All" links to the collections index.
*/
export default function CollectionSwitcher({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug: string;
}) {
  return (
    <nav
      aria-label="Switch collection"
      className="-mx-4 mb-8 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex w-max gap-2">
        <Link
          href="/collections"
          className="shrink-0 border border-line px-4 py-2 text-[11px] font-semibold uppercase tracking-label text-muted transition hover:border-white/40 hover:text-white"
        >
          All Collections
        </Link>
        {categories.map((c) => {
          const active = c.slug === activeSlug;
          return (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 border px-4 py-2 text-[11px] font-semibold uppercase tracking-label transition ${
                active
                  ? "border-white bg-white text-black"
                  : "border-line text-muted hover:border-white/40 hover:text-white"
              }`}
            >
              {c.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
