const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 2;

export function validateCover(file: File): string | null {
  if (!ALLOWED.includes(file.type)) return "Подходят только JPG, PNG или WebP";
  if (file.size > MAX_MB * 1024 * 1024) return `Файл больше ${MAX_MB} МБ`;
  return null;
}
