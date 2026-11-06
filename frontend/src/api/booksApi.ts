import { BASE_URL, isDemo, request } from "./client";
import * as mock from "./booksMock";
import type { Book, BookInput, Counts, Status } from "../types";

/**
 * Параметры списка. Сортировки нет: порядок фиксирован на сервере
 * («Прочитано» по дате завершения, остальные по дате добавления, сначала новые).
 */
export interface BookQuery {
  status?: Status;
  year?: number; // только вместе с status = "read"
}

function qs(params: object): string {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Полный адрес картинки обложки (бэкенд отдаёт путь вида /static/covers/x.jpg) */
export function coverUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("data:")) return path; // обложка из демо-режима
  return BASE_URL + path;
}

// В демо-режиме (вход кнопкой «Демо-вход») все функции работают с mock, без сервера.

export const getBooks = (q: BookQuery): Promise<Book[]> =>
  isDemo() ? mock.getBooks(q) : request<Book[]>(`/books${qs(q)}`);

export const getCounts = (): Promise<Counts> =>
  isDemo() ? mock.getCounts() : request<Counts>("/books/counts");

export const getYears = (): Promise<number[]> =>
  isDemo() ? mock.getYears() : request<number[]>("/books/years");

/** При создании пустые поля (null) не отправляем */
export function createBook(input: BookInput): Promise<Book> {
  if (isDemo()) return mock.createBook(input);
  const body = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== null && v !== undefined));
  return request<Book>("/books", { method: "POST", body });
}

/**
 * Сервер ничего не обнуляет сам: при смене статуса лишние поля нужно прислать как null
 * (см. таблицу в API.md). Правила проверяются по итоговому состоянию книги.
 */
export const updateBook = (id: number, patch: Partial<BookInput>): Promise<Book> =>
  isDemo() ? mock.updateBook(id, patch) : request<Book>(`/books/${id}`, { method: "PATCH", body: patch });

export const deleteBook = (id: number): Promise<void> =>
  isDemo() ? mock.deleteBook(id) : request<void>(`/books/${id}`, { method: "DELETE" });

/** Загрузка или замена обложки. В ответе объект книги с новым cover_path */
export function uploadCover(id: number, file: File): Promise<Book> {
  if (isDemo()) return mock.uploadCover(id, file);
  const form = new FormData();
  form.append("file", file);
  return request<Book>(`/books/${id}/cover`, { method: "POST", form });
}

/** Удаление обложки. В ответе объект книги с cover_path = null */
export const deleteCover = (id: number): Promise<Book> =>
  isDemo() ? mock.deleteCover(id) : request<Book>(`/books/${id}/cover`, { method: "DELETE" });
