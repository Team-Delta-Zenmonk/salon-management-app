export interface MediaTransformOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "thumb";
  gravity?: "auto" | "faces" | "face" | "center";
  quality?: "auto" | "auto:good" | "auto:best";
  format?: "auto" | "webp" | "avif";
}

export const MEDIA_PRESETS = {
  SALON_BANNER: {
    width: 2400,
    height: 700,
    crop: "fill",
    gravity: "auto",
    quality: "auto:best",
    format: "auto",
  } as MediaTransformOptions,
  SALON_GALLERY_THUMB: {
    width: 400,
    height: 300,
    crop: "fill",
    gravity: "auto",
    quality: "auto:good",
    format: "auto",
  } as MediaTransformOptions,
  AVATAR: {
    width: 160,
    height: 160,
    crop: "fill",
    gravity: "face",
    quality: "auto:good",
    format: "auto",
  } as MediaTransformOptions,
  STAFF_COVER: {
    width: 640,
    height: 480,
    crop: "fill",
    gravity: "face",
    quality: "auto:good",
    format: "auto",
  } as MediaTransformOptions,
};

export function getOptimizedImageUrl(
  url?: string | null,
  options: MediaTransformOptions = {}
): string {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();
  if (trimmed.startsWith("data:") || trimmed.includes(".svg")) return trimmed;

  const uploadMarker = "/upload/";
  const uploadIndex = trimmed.indexOf(uploadMarker);
  if (uploadIndex === -1 || !trimmed.includes("res.cloudinary.com")) return trimmed;

  const prefix = trimmed.substring(0, uploadIndex + uploadMarker.length);
  const remaining = trimmed.substring(uploadIndex + uploadMarker.length);

  const segments = remaining.split("/");
  const assetPath =
    segments.length > 1 && !segments[0].startsWith("v") && /^[a-z]{1,3}_/.test(segments[0])
      ? segments.slice(1).join("/")
      : remaining;

  const transforms: string[] = [
    `f_${options.format || "auto"}`,
    `q_${options.quality || "auto"}`,
  ];

  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  if (options.gravity) transforms.push(`g_${options.gravity}`);

  return `${prefix}${transforms.join(",")}/${assetPath}`;
}
