"use client";

/*
  Client-side catalogue browser: category filter chips + sort control,
  operating over a product list passed in by the server page (Supabase-backed).
  Initial category/sort are seeded from the URL (?category=, ?sort=) so the
  homepage "View all" links and footer links land pre-filtered.

  Sorting note: prices are display strings, so we sort on parsePrice().
  The server returns products newest-first, so "new" = source order and
  "best" = featured (badged) first — no server-data import needed on the client.
*/

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/data/types";
import ProductGrid from "@/components/ProductGrid";
import { parsePrice } from "@/lib/money";

type SortKey = "featured" | "new" | "best" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "new", label: "Newest" },
  { value: "best", label: "Best Selling" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export default function ShopBrowser({
  products,
  categories,
  lockedCategory,
}: {
  products: Product[];
  categories: { title: string; slug: string }[];
  /** When set (collection pages), the category filter is fixed and hidden. */
  lockedCategory?: string;
}) {
  const searchParams = useSearchParams();

  const initialCategory =
    lockedCategory ?? searchParams.get("category") ?? "all";
  const initialSort = (searchParams.get("sort") as SortKey) || "featured";

  const [category, setCategory] = useState<string>(initialCategory);
  const [sort, setSort] = useState<SortKey>(
    SORT_OPTIONS.some((o) => o.value === initialSort) ? initialSort : "featured",
  );

  const visible = useMemo(() => {
    let list =
      category === "all"
        ? products
        : products.filter((p) => p.category === category);

    list = [...list];
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        break;
      case "price-desc":
        list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        break;
      case "new":
        break; // server returns newest-first → source order
      case "best":
        // Badged/featured items first, otherwise keep source order.
        list.sort((a, b) => Number(Boolean(b.badge)) - Number(Boolean(a.badge)));
        break;
      default:
        break; // featured = source order
    }
    return list;
  }, [products, category, sort]);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-center md:justify-between">
        {!lockedCategory && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <FilterChip
              label="All"
              active={category === "all"}
              onClick={() => setCategory("all")}
            />
            {categories.map((c) => (
              <FilterChip
                key={c.slug}
                label={c.title}
                active={category === c.slug}
                onClick={() => setCategory(c.slug)}
              />
            ))}
          </div>
        )}

        <label className="flex items-center gap-2 text-[11px] uppercase tracking-label text-muted md:ml-auto">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="border border-line bg-charcoal px-3 py-2 text-[11px] uppercase tracking-label text-white outline-none focus:border-white/40"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-charcoal">
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-5 text-[11px] uppercase tracking-label text-soft-muted">
        {visible.length} {visible.length === 1 ? "item" : "items"}
      </p>

      {visible.length > 0 ? (
        <div className="mt-5">
          <ProductGrid products={visible} />
        </div>
      ) : (
        <p className="mt-12 text-center text-[13px] text-muted">
          No items in this category yet.
        </p>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border px-4 py-2 text-[11px] font-semibold uppercase tracking-label transition ${
        active
          ? "border-white bg-white text-black"
          : "border-line text-muted hover:border-white/40 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
