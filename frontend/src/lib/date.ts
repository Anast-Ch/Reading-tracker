/** Сегодняшняя дата в формате ГГГГ-ММ-ДД (по местному времени) */
export function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * «2026-10-12» -> «12.10.2026».
 * Время создания приходит в UTC («2026-01-10T12:00:00Z»), его переводим в местную дату.
 */
export function formatDate(s?: string | null): string {
  if (!s) return "";
  if (s.length > 10) return new Date(s).toLocaleDateString("ru-RU");
  const [y, m, d] = s.split("-");
  return `${d}.${m}.${y}`;
}
