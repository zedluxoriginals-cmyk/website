import type { AdminCategory, AdminProductDetail } from "@/lib/admin/products";
import { createProduct, updateProduct } from "@/app/admin/products/actions";

export default function ProductForm({
  product,
  categories,
}: {
  product?: AdminProductDetail;
  categories: AdminCategory[];
}) {
  const action = product ? updateProduct : createProduct;

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      {product && <input type="hidden" name="product_id" value={product.id} />}

      <section className="space-y-5">
        <Field label="Title" required>
          <input name="title" required defaultValue={product?.title} className={inputCls} />
        </Field>
        <Field label="Slug">
          <input name="slug" defaultValue={product?.slug} className={inputCls} />
        </Field>
        <Field label="Subtitle">
          <input name="subtitle" defaultValue={product?.subtitle ?? ""} className={inputCls} />
        </Field>
        <Field label="Description">
          <textarea
            name="description"
            defaultValue={product?.description ?? ""}
            rows={7}
            className={textareaCls}
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Price (NGN)" required>
            <input
              name="base_price"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={product?.basePrice}
              className={inputCls}
            />
          </Field>
          <Field label="Compare At">
            <input
              name="compare_at_price"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.compareAtPrice ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Badge">
            <input name="badge" defaultValue={product?.badge ?? ""} placeholder="NEW" className={inputCls} />
          </Field>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Material">
            <input name="material" defaultValue={product?.material ?? ""} className={inputCls} />
          </Field>
          <Field label="Fit Notes">
            <input name="fit_notes" defaultValue={product?.fitNotes ?? ""} className={inputCls} />
          </Field>
          <Field label="Care">
            <input name="care_instructions" defaultValue={product?.careInstructions ?? ""} className={inputCls} />
          </Field>
        </div>

        {!product && (
          <Field label="Main photo link (optional)">
            <input
              name="primary_image_url"
              placeholder="Paste a photo link, or add photos after saving"
              className={inputCls}
            />
          </Field>
        )}
      </section>

      <aside className="h-fit space-y-5 border border-line bg-ink p-5 lg:sticky lg:top-24">
        <Field label="Status">
          <select name="status" defaultValue={product?.status ?? "draft"} className={inputCls}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <Field label="Category">
          <select name="category_id" defaultValue={product?.categoryId ?? ""} className={inputCls}>
            <option value="">None</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <label className="flex items-center gap-3 border border-line bg-black px-3.5 py-3 text-[12px] text-muted">
          <input
            name="is_featured"
            type="checkbox"
            defaultChecked={product?.isFeatured ?? false}
            className="h-4 w-4 accent-white"
          />
          Featured product
        </label>

        <button
          type="submit"
          className="w-full bg-white py-3.5 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white"
        >
          {product ? "Save Product" : "Create Product"}
        </button>
      </aside>
    </form>
  );
}

const inputCls =
  "h-[46px] w-full border border-[#303030] bg-[#090909] px-3.5 text-[13px] text-white placeholder:text-soft-muted focus:border-white focus:outline-none";

const textareaCls =
  "w-full border border-[#303030] bg-[#090909] px-3.5 py-3 text-[13px] leading-relaxed text-white placeholder:text-soft-muted focus:border-white focus:outline-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-label text-soft-muted">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
