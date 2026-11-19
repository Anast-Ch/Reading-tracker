import { isDemo, request } from "./client";
import * as mock from "./statsMock";
import type { Period, Season } from "../lib/period";

export interface Stats {
  period: "month" | "season" | "year";
  year: number;
  month: number | null;
  season: Season | null;
  count_read: number;
  average_rating: number | null; 
}

export function getStats(p: Period): Promise<Stats> {
  if (isDemo()) return mock.getStats(p);
  const params = new URLSearchParams({ period: p.type, year: String(p.year) });
  if (p.type === "month") params.set("month", String(p.month));
  if (p.type === "season") params.set("season", p.season);
  return request<Stats>(`/stats?${params.toString()}`);
}
