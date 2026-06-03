import type { Metadata } from "next";
import Image from "next/image";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { getCurationProducts } from "@/lib/admin/homepage";
import { toggleFeatured, setHomepageBadge } from "@/app/admin/homepage/actions";

export const metadata: Metadata = { title: "Homepage" };

export default async function AdminHomepagePage() {
  const [admin, products] = await Promise.all([requireAdmin(), getCurationProducts()]);

  return (
    <AdminShell admin={admin} title="Homepage" eyebrow="Store Control">
      <p className="mb-6 max-w-prose text-[13px] leading-relaxed text-muted">
        Choose which products shine on the homepage. Feature a product in the main
        campaign, mark it as a new arrival, or flag it as a best seller. Only
        published products appear here.
      </p>

      {products.length === 0 ? (
        <div className="border border-dashed border-line px-6 py-16 text-center text-[13px] text-soft-muted">
          No published products yet. Publish a product to feature it here.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {products.map((p) => {
            const slot = p.isLatest ? "latest" : p.isBestSeller ? "bestseller" : "none";
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-4 border border-line bg-ink px-3.5 py-3"
              >
                <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-charcoal-2">
                  {p.imageUrl && (
                    <Image src={p.imageUrl} alt={p.title} fill sizes="44px" className="object-cover" />
                  )}
                </div>
                <p className="min-w-[140px] flex-1 text-[13px] font-semibold text-white">{p.title}</p>

                {/* Featured campaign toggle */}
                <form action={toggleFeatured}>
                  <input type="hidden" name="product_id" value={p.id} />
                  <input type="hidden" name="next" value={p.isFeatured ? "off" : "on"} />
                  <button
                    className={`border px-3 py-2 text-[10px] font-semibold uppercase tracking-label transition ${
                      p.isFeatured
                        ? "border-white bg-white text-black"
                        : "border-line text-muted hover:border-white/50 hover:text-white"
                    }`}
                  >
                    {p.isFeatured ? "★ Featured" : "Feature"}
                  </button>
                </form>

                {/* Homepage placement (badge) */}
                <form action={setHomepageBadge} className="flex items-center gap-2">
                  <input type="hidden" name="product_id" value={p.id} />
                  <select
                    name="slot"
                    defaultValue={slot}
                    className="h-[38px] border border-[#303030] bg-[#090909] px-2.5 text-[12px] text-white focus:border-white focus:outline-none"
                  >
                    <option value="none">No badge</option>
                    <option value="latest">New arrival</option>
                    <option value="bestseller">Best seller</option>
                  </select>
                  <button className="h-[38px] border border-line px-3 text-[10px] font-semibold uppercase tracking-label text-white transition hover:border-white/50">
                    Set
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}
