/**
 * ДЕМО-РЕЖИМ: имитация бэкенда книг в браузере (localStorage).
 * Работает, когда пользователь вошёл кнопкой «Демо-вход».
 * Повторяет правила настоящего API (см. API.md), чтобы можно было проверить
 * весь интерфейс без запущенного сервера.
 */
import { ApiError } from "./client";
import type { BookQuery } from "./booksApi";
import type { Book, BookInput, Counts } from "../types";

const KEY = "reading-tracker:demo-books";

const SEED: Book[] = [
  { id: 1, title: "Война и мир", author: "Лев Толстой", publish_year: 1869, status: "reading", start_date: "2026-10-01", finish_date: null, rating: null, pages_count: 1300, cover_path: null, created_at: "2026-10-01T12:00:00Z", updated_at: "2026-10-01T12:00:00Z" },
  { id: 2, title: "Мастер и Маргарита", author: "Михаил Булгаков", publish_year: 1967, status: "read", start_date: "2026-08-20", finish_date: "2026-09-12", rating: 5, pages_count: 480, cover_path: null, created_at: "2026-08-20T10:00:00Z", updated_at: "2026-08-20T10:00:00Z" },
  { id: 3, title: "1984", author: "Джордж Оруэлл", publish_year: 1949, status: "read", start_date: "2025-11-02", finish_date: "2025-11-20", rating: 4, pages_count: 320, cover_path: null, created_at: "2025-11-02T09:00:00Z", updated_at: "2025-11-02T09:00:00Z" },
  { id: 4, title: "Дюна", author: "Фрэнк Герберт", publish_year: 1965, status: "want_to_read", start_date: null, finish_date: null, rating: null, pages_count: null, cover_path: null, created_at: "2026-10-15T18:00:00Z", updated_at: "2026-10-15T18:00:00Z" },
];

function read(): Book[] {
  const raw = localStorage.getItem(KEY);
  if (raw === null) {
    write(SEED); // первый запуск: несколько примеров, чтобы было что смотреть
    return [...SEED];
  }
  try {
    return JSON.parse(raw) as Book[];
  } catch {
    return [];
  }
}

function write(books: Book[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(books));
  } catch {
    throw new ApiError(0, "Не хватило места в браузере. Попробуйте обложку поменьше");
  }
}

/** Те же бизнес-правила, что описаны в DB_SCHEMA.md */
function check(b: Book) {
  if (!b.title.trim() || !b.author.trim()) throw new ApiError(400, "Название и автор обязательны");
  if (b.status !== "read" && b.rating !== null) throw new ApiError(400, "Оценка возможна только для прочитанных книг");
  if (b.status === "read" && !b.finish_date) throw new ApiError(400, "Для прочитанной книги нужна дата окончания");
  if (b.status === "want_to_read" && (b.start_date || b.finish_date)) {
    throw new ApiError(400, "У книги в списке «Хочу прочитать» не должно быть дат");
  }
  if (b.start_date && b.finish_date && b.finish_date < b.start_date) {
    throw new ApiError(400, "Дата окончания раньше даты начала");
  }
}

export async function getBooks(q: BookQuery): Promise<Book[]> {
  if (q.year !== undefined && q.status !== "read") {
    throw new ApiError(400, "Фильтр по году доступен только для статуса «Прочитано»");
  }
  let list = read();
  if (q.status) list = list.filter((b) => b.status === q.status);
  if (q.year !== undefined) list = list.filter((b) => b.finish_date?.startsWith(String(q.year)));
  // Порядок фиксирован, как на сервере: «Прочитано» по дате завершения, остальные по дате добавления,
  // сначала новые, при равенстве по id
  const key = q.status === "read" ? "finish_date" : "created_at";
  return [...list].sort((a, b) => (b[key] ?? "").localeCompare(a[key] ?? "") || b.id - a.id);
}

export async function getCounts(): Promise<Counts> {
  const c: Counts = { want_to_read: 0, reading: 0, read: 0 };
  read().forEach((b) => c[b.status]++);
  return c;
}

export async function getYears(): Promise<number[]> {
  const years = read()
    .filter((b) => b.status === "read" && b.finish_date)
    .map((b) => Number(b.finish_date!.slice(0, 4)));
  return [...new Set(years)].sort((a, b) => b - a);
}

export async function createBook(input: BookInput): Promise<Book> {
  const books = read();
  const now = new Date().toISOString();
  const book: Book = {
    ...input,
    id: Math.max(0, ...books.map((b) => b.id)) + 1,
    cover_path: null,
    created_at: now,
    updated_at: now,
  };
  check(book);
  write([book, ...books]);
  return book;
}

export async function updateBook(id: number, patch: Partial<BookInput>): Promise<Book> {
  const books = read();
  const i = books.findIndex((b) => b.id === id);
  if (i === -1) throw new ApiError(404, "Книга не найдена");
  const updated = { ...books[i], ...patch, updated_at: new Date().toISOString() };
  check(updated);
  books[i] = updated;
  write(books);
  return updated;
}

export async function deleteBook(id: number): Promise<void> {
  write(read().filter((b) => b.id !== id));
}

export async function uploadCover(id: number, file: File): Promise<Book> {
  // В демо обложка хранится прямо в браузере как data-URL
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new ApiError(400, "Файл повреждён"));
    reader.readAsDataURL(file);
  });
  const books = read();
  const i = books.findIndex((b) => b.id === id);
  if (i === -1) throw new ApiError(404, "Книга не найдена");
  books[i] = { ...books[i], cover_path: dataUrl };
  write(books);
  return books[i];
}

export async function deleteCover(id: number): Promise<Book> {
  const books = read();
  const i = books.findIndex((b) => b.id === id);
  if (i === -1) throw new ApiError(404, "Книга не найдена");
  books[i] = { ...books[i], cover_path: null };
  write(books);
  return books[i];
}
