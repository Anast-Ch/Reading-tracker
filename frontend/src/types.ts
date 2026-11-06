// Типы совпадают с API.md и DB_SCHEMA.md бэкенда (имена полей как в ответах API).

export type Status = "want_to_read" | "reading" | "read";

export const STATUSES: Status[] = ["want_to_read", "reading", "read"];

export const STATUS_LABELS: Record<Status, string> = {
  want_to_read: "Хочу прочитать",
  reading: "Читаю",
  read: "Прочитано",
};

export interface Book {
  id: number;
  title: string;
  author: string;
  publish_year: number | null;
  status: Status;
  start_date: string | null; // ГГГГ-ММ-ДД
  finish_date: string | null; // ГГГГ-ММ-ДД
  rating: number | null; // 1-5, только для status = "read"
  pages_count: number | null;
  cover_path: string | null; // например /static/covers/abc.jpg
  created_at: string; // ISO, UTC, с суффиксом Z
  updated_at: string;
}

/** То, что пользователь вводит в форме */
export type BookInput = Omit<Book, "id" | "cover_path" | "created_at" | "updated_at">;

export type Counts = Record<Status, number>;
