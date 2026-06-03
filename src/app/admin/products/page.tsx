import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import ProductStatusForm from "@/components/admin/ProductStatusForm";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminProducts } from "@/lib/admin/products";

export const metadata: Metadata = {
  title: "Admin Products",
};

export default async function AdminProductsPage() {
  const [admin, products] = await Promise.all([requireAdmin(), getAdminProducts()]);

  return (
    <AdminShell
      admin={admin}
      title="Catalog"
      eyebrow="Store Control"
      actions={
        <Link
          href="/admin/products/new"
          className="bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white"
        >
          Add product
        </Link>
      }
    >
      {products.length === 0 ? (
        <div className="border border-dashed border-line px-6 py-16 text-center text-[13px] text-soft-muted">
          No products yet. Add your first product to start selling.
        </div>
      ) : (
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead className="bg-ink">
            <tr className="text-[10px] uppercase tracking-label text-soft-muted">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-black">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-charcoal-2">
                      {product.imageUrl && (
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-label text-white">
                        {product.title}
                      </p>
                      <p className="mt-1 text-[11px] text-soft-muted">{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-[11px] uppercase tracking-label text-muted">
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-[12px] text-muted">
                  {product.categoryName ?? "Unassigned"}
                </td>
                <td className="px-4 py-4 text-[12px] text-white">
                  ₦{product.basePrice.toLocaleString("en-NG")}
                </td>
                <td className="px-4 py-4 text-[12px] text-muted">
                  {product.stockTotal} across {product.variantCount} variants
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-[11px] font-semibold uppercase tracking-label text-white transition hover:opacity-70"
                    >
                      Edit
                    </Link>
                    <ProductStatusForm productId={product.id} status={product.status} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </AdminShell>
  );
}
