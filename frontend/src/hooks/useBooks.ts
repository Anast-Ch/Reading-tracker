import { useCallback, useEffect, useRef, useState } from "react";
import {
  createBook,
  deleteBook,
  deleteCover,
  getBooks,
  getCounts,
  getYears,
  updateBook,
  uploadCover,
} from "../api/booksApi";
import type { BookQuery } from "../api/booksApi";
import { messageOf } from "../api/client";
import type { Book, BookInput, Counts } from "../types";

export interface CoverChange {
  file?: File; 
  remove?: boolean; 
}

const EMPTY_COUNTS: Counts = { want_to_read: 0, reading: 0, read: 0 };

async function applyCover(id: number, cover?: CoverChange): Promise<string | null> {
  try {
    if (cover?.file) await uploadCover(id, cover.file);
    else if (cover?.remove) await deleteCover(id);
    return null;
  } catch (e) {
    return `Книга сохранена, но с обложкой возникла проблема: ${messageOf(e)}`;
  }
}

export function useBooks(query: BookQuery) {
  const [books, setBooks] = useState<Book[]>([]);
  const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const lastRequest = useRef(0);

  const { status, year, sort_by, order } = query;

  const reload = useCallback(async () => {
    const id = ++lastRequest.current; 
    try {
      const [b, c, y] = await Promise.all([
        getBooks({ status, year, sort_by, order }),
        getCounts(),
        getYears(),
      ]);
      if (id !== lastRequest.current) return;
      setBooks(b);
      setCounts(c);
      setYears(y);
      setError("");
    } catch (e) {
      if (id === lastRequest.current) setError(messageOf(e));
    } finally {
      if (id === lastRequest.current) setLoading(false);
    }
  }, [status, year, sort_by, order]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  const create = useCallback(
    async (input: BookInput, cover?: CoverChange) => {
      const book = await createBook(input);
      const warning = await applyCover(book.id, cover);
      await reload();
      return warning;
    },
    [reload]
  );

  const update = useCallback(
    async (id: number, patch: Partial<BookInput>, cover?: CoverChange) => {
      await updateBook(id, patch);
      const warning = await applyCover(id, cover);
      await reload();
      return warning;
    },
    [reload]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteBook(id);
      await reload();
    },
    [reload]
  );

  return { books, counts, years, loading, error, create, update, remove };
}
