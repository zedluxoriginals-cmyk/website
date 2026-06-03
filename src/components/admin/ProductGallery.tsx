import Image from "next/image";
import PhotoUploader from "@/components/admin/PhotoUploader";
import type { AdminImage } from "@/lib/admin/inventory";
import {
  addProductImage,
  setPrimaryImage,
  deleteProductImage,
  reorderProductImage,
} from "@/app/admin/products/image-actions";

/*
  Product photo manager. Operators upload photos (drag-drop), pick the main one,
  reorder the gallery, and remove photos — all in plain store language.
*/
export default function ProductGallery({
  productId,
  images,
}: {
  productId: string;
  images: AdminImage[];
}) {
  return (
    <section className="space-y-4">
      <p className="text-[10px] font-semibold uppercase tracking-label text-soft-muted">
        Product photos
      </p>

      <PhotoUploader productId={productId} />

      {images.length === 0 ? (
        <p className="border border-dashed border-line px-4 py-6 text-[12px] text-soft-muted">
          No photos yet. Upload one above, or paste a photo link below.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img, index) => (
            <li key={img.id} className="border border-line bg-ink">
              <div className="relative aspect-[4/5] overflow-hidden bg-charcoal-2">
                <Image src={img.url} alt={img.altText ?? "Product photo"} fill sizes="200px" className="object-cover" />
                {img.isPrimary && (
                  <span className="absolute left-2 top-2 bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-label text-black">
                    Main
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2.5 py-2 text-[10px] uppercase tracking-label">
                {!img.isPrimary && (
                  <form action={setPrimaryImage}>
                    <input type="hidden" name="image_id" value={img.id} />
                    <input type="hidden" name="product_id" value={productId} />
                    <button className="font-semibold text-white transition hover:opacity-70">Set main</button>
                  </form>
                )}
                <form action={reorderProductImage}>
                  <input type="hidden" name="image_id" value={img.id} />
                  <input type="hidden" name="product_id" value={productId} />
                  <input type="hidden" name="direction" value="up" />
                  <button disabled={index === 0} className="text-muted transition hover:text-white disabled:opacity-30">↑</button>
                </form>
                <form action={reorderProductImage}>
                  <input type="hidden" name="image_id" value={img.id} />
                  <input type="hidden" name="product_id" value={productId} />
                  <input type="hidden" name="direction" value="down" />
                  <button disabled={index === images.length - 1} className="text-muted transition hover:text-white disabled:opacity-30">↓</button>
                </form>
                <form action={deleteProductImage} className="ml-auto">
                  <input type="hidden" name="image_id" value={img.id} />
                  <input type="hidden" name="product_id" value={productId} />
                  <button className="text-red-400 transition hover:opacity-70">Remove</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Paste-a-link fallback — always available even before upload is set up */}
      <form action={addProductImage} className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row">
        <input
          name="product_id"
          type="hidden"
          value={productId}
        />
        <input
          name="url"
          required
          placeholder="Or paste a photo link"
          className="h-[44px] flex-1 border border-[#303030] bg-[#090909] px-3 text-[13px] text-white placeholder:text-soft-muted focus:border-white focus:outline-none"
        />
        <button className="h-[44px] border border-line px-5 text-[11px] font-semibold uppercase tracking-label text-white transition hover:border-white/50">
          Add photo
        </button>
      </form>
    </section>
  );
}
