"use client";

import { useRef, useState, useTransition } from "react";
import { addProductImage } from "@/app/admin/products/image-actions";
import { compressImage } from "@/lib/admin/compress-image";

/*
  Drag-and-drop photo upload. The customer-facing label never names the storage
  provider — it just says "Upload photos". Files go straight from the browser to
  the image host using an unsigned upload preset (browser-safe), then we hand the
  finished photo link to the server to attach it to the product.
*/

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function PhotoUploader({ productId }: { productId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const configured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

  async function uploadOne(file: File): Promise<string> {
    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", UPLOAD_PRESET as string);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body },
    );
    if (!res.ok) throw new Error("upload-failed");
    const json = (await res.json()) as { secure_url?: string };
    if (!json.secure_url) throw new Error("upload-failed");
    return json.secure_url;
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        // Shrink to web size in the browser before it leaves the device.
        const ready = await compressImage(file);
        const url = await uploadOne(ready);
        const fd = new FormData();
        fd.append("product_id", productId);
        fd.append("url", url);
        await addProductImage(fd);
      }
      startTransition(() => {
        /* server action already revalidated; refresh handled by Next */
      });
    } catch {
      setError("A photo could not upload. Please try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (!configured) {
    return (
      <div className="border border-dashed border-line px-4 py-6 text-[12px] text-soft-muted">
        Photo upload isn&rsquo;t set up yet. You can still add a photo by pasting a
        link below.
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        disabled={busy}
        className={`flex w-full flex-col items-center justify-center gap-1 border border-dashed px-4 py-8 text-center transition ${
          dragging ? "border-white bg-ink" : "border-line hover:border-white/40"
        } ${busy ? "opacity-60" : ""}`}
      >
        <span className="text-[13px] font-semibold text-white">
          {busy ? "Uploading…" : "Upload photos"}
        </span>
        <span className="text-[11px] text-soft-muted">
          Drag photos here, or click to choose files
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {error && <p className="mt-2 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
