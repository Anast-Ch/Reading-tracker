import { useCallback, useEffect, useState } from "react";
import type { Book } from "../types";

const KEY = "reading-tracker:books";

function load(): Book[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Book[]) : [];
  } catch {
    return [];
  }
}

/**
 * Временное хранилище книг в браузере.
 * Когда появится бэкенд, замените тело add/remove на запросы к API,
 * а интерфейс хука (books, add, remove) оставьте прежним.
 */
export function useBooks() {
  const [books, setBooks] = useState<Book[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(books));
    } catch {
      console.warn("Не удалось сохранить книги: хранилище переполнено");
    }
  }, [books]);

  const add = useCallback((data: Omit<Book, "id" | "addedAt">) => {
    const book: Book = {
      ...data,
      id: crypto.randomUUID(),
      addedAt: new Date().toISOString(),
    };
    setBooks((prev) => [book, ...prev]);
  }, []);

  const remove = useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { books, add, remove };
}
