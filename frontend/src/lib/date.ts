export function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function formatDate(s?: string | null): string {
  if (!s) return "";
  if (s.length > 10) return new Date(s).toLocaleDateString("ru-RU");
  const [y, m, d] = s.split("-");
  return `${d}.${m}.${y}`;
}
