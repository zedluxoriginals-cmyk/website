import type { AdminVariant } from "@/lib/admin/inventory";
import { naira } from "@/lib/admin/format";
import {
  updateVariantStock,
  addVariant,
  deleteVariant,
} from "@/app/admin/products/inventory-actions";

/*
  Inventory editor. Each size/colour option shows its stock and a low-stock
  threshold the operator can tune; rows at or below threshold are flagged.
*/
export default function VariantManager({
  productId,
  variants,
}: {
  productId: string;
  variants: AdminVariant[];
}) {
  return (
    <section className="space-y-4">
      <p className="text-[10px] font-semibold uppercase tracking-label text-soft-muted">
        Sizes, colours &amp; stock
      </p>

      {variants.length === 0 ? (
        <p className="border border-dashed border-line px-4 py-6 text-[12px] text-soft-muted">
          No size or colour options yet. Add one below.
        </p>
      ) : (
        <div className="space-y-2.5">
          {variants.map((v) => (
            <form
              key={v.id}
              action={updateVariantStock}
              className={`flex flex-wrap items-end gap-3 border px-3.5 py-3 ${
                v.isLow ? "border-amber-500/40 bg-amber-500/[0.04]" : "border-line bg-ink"
              }`}
            >
              <input type="hidden" name="variant_id" value={v.id} />
              <input type="hidden" name="product_id" value={productId} />

              <div className="min-w-[120px] flex-1">
                <p className="text-[12px] font-semibold text-white">{v.label}</p>
                <p className="text-[11px] text-soft-muted">
                  {v.sku ?? "No code"}
                  {v.price != null ? ` · ${naira(v.price)}` : ""}
                  {v.isLow ? " · Low stock" : ""}
                </p>
              </div>

              <MiniField label="In stock">
                <input name="stock_quantity" type="number" min="0" defaultValue={v.stock} className={miniInput} />
              </MiniField>
              <MiniField label="Alert at">
                <input name="low_stock_threshold" type="number" min="0" defaultValue={v.lowStockThreshold} className={miniInput} />
              </MiniField>

              <label className="flex items-center gap-2 pb-2 text-[11px] text-muted">
                <input name="is_active" type="checkbox" defaultChecked={v.isActive} className="h-4 w-4 accent-white" />
                Selling
              </label>

              <button className="h-[40px] bg-white px-4 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white">
                Save
              </button>
              <button
                formAction={deleteVariant}
                className="h-[40px] px-3 text-[11px] font-semibold uppercase tracking-label text-red-400 transition hover:opacity-70"
              >
                Remove
              </button>
            </form>
          ))}
        </div>
      )}

      {/* Add a new size/colour option */}
      <form action={addVariant} className="grid gap-3 border border-dashed border-line p-4 sm:grid-cols-2 lg:grid-cols-3">
        <input type="hidden" name="product_id" value={productId} />
        <MiniField label="Size">
          <input name="size" placeholder="M" className={addInput} />
        </MiniField>
        <MiniField label="Colour">
          <input name="color_name" placeholder="Black" className={addInput} />
        </MiniField>
        <MiniField label="Code (optional)">
          <input name="sku" placeholder="SKU" className={addInput} />
        </MiniField>
        <MiniField label="Price override (optional)">
          <input name="price" type="number" min="0" placeholder="—" className={addInput} />
        </MiniField>
        <MiniField label="Starting stock">
          <input name="stock_quantity" type="number" min="0" defaultValue={0} className={addInput} />
        </MiniField>
        <MiniField label="Alert at">
          <input name="low_stock_threshold" type="number" min="0" defaultValue={3} className={addInput} />
        </MiniField>
        <div className="sm:col-span-2 lg:col-span-3">
          <button className="border border-line px-5 py-3 text-[11px] font-semibold uppercase tracking-label text-white transition hover:border-white/50">
            Add option
          </button>
        </div>
      </form>
    </section>
  );
}

const miniInput =
  "h-[40px] w-[84px] border border-[#303030] bg-[#090909] px-2.5 text-[13px] text-white focus:border-white focus:outline-none";
const addInput =
  "h-[44px] w-full border border-[#303030] bg-[#090909] px-3 text-[13px] text-white placeholder:text-soft-muted focus:border-white focus:outline-none";

function MiniField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-label text-soft-muted">{label}</span>
      {children}
    </label>
  );
}
