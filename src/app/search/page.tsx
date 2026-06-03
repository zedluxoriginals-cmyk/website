import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import SearchView from "@/components/search/SearchView";
import { getAllProducts } from "@/lib/api/products";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage() {
  const catalogue = await getAllProducts();

  return (
    <>
      <Header variant="solid" />
      <main className="container-zed pb-16 pt-10">
        <div className="mb-8">
          <p className="eyebrow text-[11px] text-muted">Search</p>
          <h1 className="mt-2 font-serif text-[40px] leading-none text-white md:text-[52px]">
            Find Your Piece
          </h1>
        </div>
        <Suspense fallback={null}>
          <SearchView catalogue={catalogue} />
        </Suspense>
      </main>
    </>
  );
}
