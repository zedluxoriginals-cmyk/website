/*
  Client-side photo shrink — runs in the operator's browser BEFORE upload so a
  straight-from-camera photo (often 4-6MB / 4000px+) becomes a web-sized JPEG
  (~300-500KB) before it ever leaves their phone. Critical on slow mobile
  connections. Delivery is separately optimized on the store (f_auto/q_auto),
  so this only governs how heavy the upload itself is.

  Safe by design: any failure (unsupported type, decode error, no canvas)
  falls back to the original file, so an upload never silently breaks.
*/

const MAX_EDGE = 2000; // px on the longest side
const QUALITY = 0.82;

export async function compressImage(file: File): Promise<File> {
  // Leave non-raster formats (SVG, GIF) and tiny files untouched.
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }
  if (typeof document === "undefined") return file;

  try {
    const bitmap = await loadBitmap(file);
    const { width, height } = bitmap;
    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));

    // Already web-sized and reasonably small — don't re-encode needlessly.
    if (scale === 1 && file.size <= 1_200_000) {
      close(bitmap);
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      close(bitmap);
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    close(bitmap);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY),
    );
    if (!blob || blob.size >= file.size) return file; // never make it bigger

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }
  // Fallback for browsers without createImageBitmap.
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function close(bitmap: ImageBitmap | HTMLImageElement) {
  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();
}
