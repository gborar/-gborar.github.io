// Reduce las fotos antes de guardarlas: 1280 px de lado mayor, JPEG 0,82. Respeta la orientación EXIF.
export const MAX_SIDE = 1280;

export function fitSize(w, h, max = MAX_SIDE) {
  const k = Math.min(1, max / Math.max(w, h));
  return { width: Math.round(w * k), height: Math.round(h * k) };
}

export async function shrinkPhoto(file) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw Object.assign(new Error("bad image"), { code: "bad_image" });
  }
  const { width, height } = fitSize(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", 0.82));
  if (!blob) throw Object.assign(new Error("encode failed"), { code: "bad_image" });
  return blob;
}
