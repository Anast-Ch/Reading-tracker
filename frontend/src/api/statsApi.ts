import { isDemo, request } from "./client";
import * as mock from "./statsMock";
import type { Period, Season } from "../lib/period";

/** Ответ GET /stats (см. API.md) */
export interface Stats {
  period: "month" | "season" | "year";
  year: number;
  month: number | null;
  season: Season | null;
  count_read: number;
  average_rating: number | null; // null, если нет оценок
}

export function getStats(p: Period): Promise<Stats> {
  if (isDemo()) return mock.getStats(p);
  const params = new URLSearchParams({ period: p.type, year: String(p.year) });
  // month и season передаются только вместе со своим периодом, иначе сервер вернёт 400
  if (p.type === "month") params.set("month", String(p.month));
  if (p.type === "season") params.set("season", p.season);
  return request<Stats>(`/stats?${params.toString()}`);
}
