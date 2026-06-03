import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminCategories } from "@/lib/admin/products";

export const metadata: Metadata = {
  title: "Add Product",
};

export default async function NewProductPage() {
  const [admin, categories] = await Promise.all([requireAdmin(), getAdminCategories()]);

  return (
    <AdminShell admin={admin} title="Add Product" eyebrow="Store Control / Catalog">
      <ProductForm categories={categories} />
    </AdminShell>
  );
}
