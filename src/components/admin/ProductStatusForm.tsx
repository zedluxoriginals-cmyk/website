import { setProductStatus } from "@/app/admin/products/actions";
import type { Database } from "@/lib/supabase/database.types";

type ProductStatus = Database["public"]["Enums"]["product_status"];

export default function ProductStatusForm({
  productId,
  status,
}: {
  productId: string;
  status: ProductStatus;
}) {
  const nextStatus = status === "active" ? "draft" : "active";

  return (
    <form action={setProductStatus}>
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="status" value={nextStatus} />
      <button
        type="submit"
        className="text-[11px] font-semibold uppercase tracking-label text-muted transition hover:text-white"
      >
        {nextStatus === "active" ? "Publish" : "Unpublish"}
      </button>
    </form>
  );
}
