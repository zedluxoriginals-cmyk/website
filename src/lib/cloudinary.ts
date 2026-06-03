const CLOUDINARY_HOST = "res.cloudinary.com";

type CloudinaryTransformOptions = {
  width?: number;
  quality?: "auto" | number;
};

export function isCloudinaryUrl(src: string): boolean {
  try {
    return new URL(src).hostname === CLOUDINARY_HOST;
  } catch {
    return false;
  }
}

export function cldUrl(src: string, options: CloudinaryTransformOptions = {}): string {
  if (!isCloudinaryUrl(src)) return src;

  const url = new URL(src);
  const segments = url.pathname.split("/");
  const uploadIndex = segments.indexOf("upload");
  if (uploadIndex === -1) return src;

  const transforms = ["f_auto", `q_${options.quality ?? "auto"}`];
  if (options.width) transforms.push(`w_${options.width}`, "c_limit");

  const nextSegment = segments[uploadIndex + 1];
  if (nextSegment?.includes("f_auto") || nextSegment?.startsWith("q_")) {
    segments.splice(uploadIndex + 1, 1, transforms.join(","));
  } else {
    segments.splice(uploadIndex + 1, 0, transforms.join(","));
  }

  url.pathname = segments.join("/");
  return url.toString();
}
