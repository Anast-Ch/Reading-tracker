import { getBooks } from "./booksMock";
import type { Stats } from "./statsApi";
import { inRange, periodRange } from "../lib/period";
import type { Period } from "../lib/period";

export async function getStats(p: Period): Promise<Stats> {
  const range = periodRange(p);
  const books = (await getBooks({ status: "read" })).filter((b) => inRange(b.finish_date, range));
  const ratings = books.map((b) => b.rating).filter((r): r is number => r !== null);
  const average = ratings.length
    ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 100) / 100
    : null;
  return {
    period: p.type,
    year: p.year,
    month: p.type === "month" ? p.month : null,
    season: p.type === "season" ? p.season : null,
    count_read: books.length,
    average_rating: average,
  };
}
