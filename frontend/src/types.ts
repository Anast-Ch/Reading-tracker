export type Status = "want_to_read" | "reading" | "read";

export const STATUSES: Status[] = ["want_to_read", "reading", "read"];

export const STATUS_LABELS: Record<Status, string> = {
  want_to_read: "Хочу прочитать",
  reading: "Читаю",
  read: "Прочитано",
};

export type SortBy = "created_at" | "start_date" | "finish_date" | "title" | "author";

export interface Book {
  id: number;
  title: string;
  author: string;
  publish_year: number | null;
  status: Status;
  start_date: string | null; 
  finish_date: string | null; 
  rating: number | null; 
  pages_count: number | null;
  cover_path: string | null; 
  created_at: string; 
}

export type BookInput = Omit<Book, "id" | "cover_path" | "created_at">;

export type Counts = Record<Status, number>;
