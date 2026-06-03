"use client";

/*
  Client-side search over the catalogue. The full product list is fetched by
  the server page and passed in as `catalogue`, so search stays instant
  (filters in the browser as you type) while the data source is Supabase.
  The URL `?q=` seeds the initial query and updates as you type.
*/

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/data/types";
import ProductGrid from "@/components/ProductGrid";
import RecentlyViewed from "@/components/wishlist/RecentlyViewed";
import { SearchIcon } from "@/components/icons";

const SUGGESTIONS = ["Tee", "Jacket", "Tracksuit", "Cap", "Hoodie", "Set"];

function matches(catalogue: Product[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return catalogue.filter((p) => {
    const haystack = [
      p.title,
      p.category,
      p.badge ?? "",
      ...p.colors.map((c) => c.name),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export default function SearchView({ catalogue }: { catalogue: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const results = useMemo(() => matches(catalogue, query), [catalogue, query]);
  const searchVisuals = useMemo(() => catalogue.slice(0, 6), [catalogue]);
  const trimmed = query.trim();

  function update(next: string) {
    setQuery(next);
    const params = new URLSearchParams();
    if (next.trim()) params.set("q", next.trim());
    router.replace(`/search${params.toString() ? `?${params}` : ""}`, {
      scroll: false,
    });
  }

  return (
    <div>
      {/* Search input */}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-soft-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => update(e.target.value)}
          placeholder="Search for products, categories, colors..."
          aria-label="Search products"
          className="h-[52px] w-full border border-line bg-charcoal pl-12 pr-4 text-[14px] text-white placeholder:text-soft-muted focus:border-white focus:outline-none"
        />
      </div>

      {/* Suggested searches */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-label text-soft-muted">
          Suggested
        </span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => update(s)}
            className="border border-line px-3.5 py-1.5 text-[11px] uppercase tracking-label text-muted transition hover:border-white/40 hover:text-white"
          >
            {s}
          </button>
        ))}
      </div>

      {searchVisuals.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {searchVisuals.map((product) => (
            <button
              key={product.slug}
              type="button"
              onClick={() => update(product.title)}
              className="group relative aspect-[4/5] overflow-hidden border border-line bg-charcoal-2"
              aria-label={`Search ${product.title}`}
            >
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                sizes="(max-width: 639px) 33vw, 16vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-70" />
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="mt-10">
        {!trimmed ? (
          <p className="text-[13px] text-muted">
            Start typing to search the collection.
          </p>
        ) : results.length > 0 ? (
          <>
            <p className="mb-5 text-[11px] uppercase tracking-label text-soft-muted">
              {results.length} {results.length === 1 ? "result" : "results"} for
              “{trimmed}”
            </p>
            <ProductGrid products={results} />
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="font-serif text-[24px] text-white">No results found</p>
            <p className="mt-2 text-[13px] text-muted">
              We couldn&apos;t find anything for “{trimmed}”. Try a different
              search.
            </p>
          </div>
        )}
      </div>

      {/* Recently viewed (self-contained section) */}
      <RecentlyViewed catalogue={catalogue} />
    </div>
  );
}
