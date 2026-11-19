import { useEffect, useRef, useState } from "react";
import { getBooks } from "../api/booksApi";
import { messageOf } from "../api/client";
import { getStats } from "../api/statsApi";
import type { Stats } from "../api/statsApi";
import type { Period } from "../lib/period";
import type { Book } from "../types";

// Данные для экрана статистики:
//stats: числа за выбранный период с сервера 
//books: все прочитанные книги
export function useStatistics(period: Period) {
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState("");

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let ignore = false;
    getBooks({ status: "read" })
      .then((b) => !ignore && setBooks(b))
      .catch((e) => !ignore && setBooksError(messageOf(e)))
      .finally(() => !ignore && setBooksLoading(false));
    return () => {
      ignore = true;
    };
  }, []);

  const lastRequest = useRef(0);
  const { type, year, month, season } = period;

  useEffect(() => {
    const id = ++lastRequest.current;
    setStatsLoading(true);
    getStats({ type, year, month, season })
      .then((s) => {
        if (id !== lastRequest.current) return;
        setStats(s);
        setStatsError("");
      })
      .catch((e) => {
        if (id === lastRequest.current) setStatsError(messageOf(e));
      })
      .finally(() => {
        if (id === lastRequest.current) setStatsLoading(false);
      });
  }, [type, year, month, season]);

  return { books, booksLoading, stats, statsLoading, error: statsError || booksError };
}
