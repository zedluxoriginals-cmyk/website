import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import ProductGallery from "@/components/admin/ProductGallery";
import VariantManager from "@/components/admin/VariantManager";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminCategories, getAdminProduct } from "@/lib/admin/products";
import { getProductImages, getProductVariants } from "@/lib/admin/inventory";

export const metadata: Metadata = {
  title: "Edit Product",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [admin, product, categories, images, variants] = await Promise.all([
    requireAdmin(),
    getAdminProduct(id),
    getAdminCategories(),
    getProductImages(id),
    getProductVariants(id),
  ]);

  if (!product) notFound();

  return (
    <AdminShell
      admin={admin}
      title={product.title}
      eyebrow="Store Control / Catalog"
      actions={
        <>
          <Link
            href={`/products/${product.slug}`}
            className="border border-line px-4 py-2.5 text-[11px] font-semibold uppercase tracking-label text-white transition hover:border-white/50"
          >
            View on store
          </Link>
          <Link
            href="/admin/products"
            className="border border-line px-4 py-2.5 text-[11px] font-semibold uppercase tracking-label text-white transition hover:border-white/50"
          >
            ← All products
          </Link>
        </>
      }
    >
      <div className="space-y-12">
        <ProductForm product={product} categories={categories} />

        <div className="border-t border-line pt-10">
          <ProductGallery productId={product.id} images={images} />
        </div>

        <div className="border-t border-line pt-10">
          <VariantManager productId={product.id} variants={variants} />
        </div>
      </div>
    </AdminShell>
  );
}
