/** Периоды статистики и работа с датами. Правила сезонов такие же, как в API.md. */
import type { Book } from "../types";

export type PeriodType = "month" | "season" | "year";
export type Season = "winter" | "spring" | "summer" | "autumn";

/** month используется при type = "month", season при type = "season" */
export interface Period {
  type: PeriodType;
  year: number;
  month: number; // 1-12
  season: Season;
}

export const SEASONS: Season[] = ["winter", "spring", "summer", "autumn"];
export const SEASON_LABELS: Record<Season, string> = {
  winter: "Зима",
  spring: "Весна",
  summer: "Лето",
  autumn: "Осень",
};
export const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
export const MONTH_SHORT = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const lastDay = (y: number, m: number) => new Date(y, m, 0).getDate();

function seasonOfMonth(m: number): Season {
  if (m === 12 || m <= 2) return "winter";
  if (m <= 5) return "spring";
  if (m <= 8) return "summer";
  return "autumn";
}

/** Текущий период выбранного типа. Декабрь относится к зиме СЛЕДУЮЩЕГО года. */
export function currentPeriod(type: PeriodType): Period {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return { type, year: type === "season" && m === 12 ? y + 1 : y, month: m, season: seasonOfMonth(m) };
}

/** Число, по которому периоды одного типа можно сравнивать */
function periodKey(p: Period): number {
  if (p.type === "year") return p.year;
  if (p.type === "month") return p.year * 12 + (p.month - 1);
  return p.year * 4 + SEASONS.indexOf(p.season);
}

/** Шаг по периодам: -1 назад, +1 вперёд */
export function shiftPeriod(p: Period, delta: number): Period {
  if (p.type === "year") return { ...p, year: p.year + delta };
  if (p.type === "month") {
    const k = periodKey(p) + delta;
    return { ...p, year: Math.floor(k / 12), month: (k % 12) + 1 };
  }
  const k = periodKey(p) + delta;
  return { ...p, year: Math.floor(k / 4), season: SEASONS[k % 4] };
}

/** В будущее листать нельзя: прочитанных книг там быть не может */
export function canGoNext(p: Period): boolean {
  return periodKey(shiftPeriod(p, 1)) <= periodKey(currentPeriod(p.type));
}

export function periodLabel(p: Period): string {
  if (p.type === "year") return String(p.year);
  if (p.type === "month") return `${MONTH_NAMES[p.month - 1]} ${p.year}`;
  return `${SEASON_LABELS[p.season]} ${p.year}`;
}

/** Пояснение, какие месяцы входят в сезон (у зимы декабрь берётся из предыдущего года) */
export function periodHint(p: Period): string {
  if (p.type !== "season") return "";
  const y = p.year;
  return {
    winter: `декабрь ${y - 1} – февраль ${y}`,
    spring: `март – май ${y}`,
    summer: `июнь – август ${y}`,
    autumn: `сентябрь – ноябрь ${y}`,
  }[p.season];
}

/** Месяцы, входящие в сезон, с годом */
function seasonMonths(p: Period): { y: number; m: number }[] {
  const y = p.year;
  switch (p.season) {
    case "winter": return [{ y: y - 1, m: 12 }, { y, m: 1 }, { y, m: 2 }];
    case "spring": return [3, 4, 5].map((m) => ({ y, m }));
    case "summer": return [6, 7, 8].map((m) => ({ y, m }));
    default: return [9, 10, 11].map((m) => ({ y, m }));
  }
}

/** Границы периода включительно, в формате ГГГГ-ММ-ДД */
export function periodRange(p: Period): { from: string; to: string } {
  if (p.type === "year") return { from: iso(p.year, 1, 1), to: iso(p.year, 12, 31) };
  if (p.type === "month") return { from: iso(p.year, p.month, 1), to: iso(p.year, p.month, lastDay(p.year, p.month)) };
  const months = seasonMonths(p);
  const first = months[0];
  const last = months[months.length - 1];
  return { from: iso(first.y, first.m, 1), to: iso(last.y, last.m, lastDay(last.y, last.m)) };
}

export function inRange(date: string | null, range: { from: string; to: string }): boolean {
  return !!date && date >= range.from && date <= range.to;
}

// ---------- Данные для блоков статистики ----------

export interface Bucket {
  label: string;
  count: number;
}

export function chartTitle(p: Period): string {
  return p.type === "month" ? "Книг по неделям" : "Книг по месяцам";
}

/** Колонки диаграммы: год это 12 месяцев, сезон это 3 месяца, месяц это недели */
export function bucketsFor(p: Period, books: Book[]): Bucket[] {
  const dates = books.map((b) => b.finish_date).filter((d): d is string => !!d);
  const inMonth = (y: number, m: number) => dates.filter((d) => d.startsWith(`${y}-${pad(m)}`));

  if (p.type === "year") {
    return MONTH_SHORT.map((label, i) => ({ label, count: inMonth(p.year, i + 1).length }));
  }
  if (p.type === "season") {
    return seasonMonths(p).map(({ y, m }) => ({ label: MONTH_SHORT[m - 1], count: inMonth(y, m).length }));
  }
  const last = lastDay(p.year, p.month);
  const weeks: [number, number][] = [[1, 7], [8, 14], [15, 21], [22, 28], [29, last]];
  return weeks
    .filter(([from]) => from <= last)
    .map(([from, to]) => ({
      label: from === to ? String(from) : `${from}–${to}`,
      count: inMonth(p.year, p.month).filter((d) => {
        const day = Number(d.slice(8, 10));
        return day >= from && day <= to;
      }).length,
    }));
}

export interface RatingDistribution {
  counts: number[]; // индекс 0 это оценка 1, индекс 4 это оценка 5
  unrated: number;
}

export function ratingDistribution(books: Book[]): RatingDistribution {
  const counts = [0, 0, 0, 0, 0];
  let unrated = 0;
  books.forEach((b) => {
    if (b.rating) counts[b.rating - 1]++;
    else unrated++;
  });
  return { counts, unrated };
}

/** 4.25 -> «4,25», 4.2 -> «4,2», null -> «—» */
export function formatAverage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return String(Number(value.toFixed(2))).replace(".", ",");
}
