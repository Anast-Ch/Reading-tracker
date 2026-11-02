export type Status = "want" | "reading" | "done";

export interface Book {
  id: string;
  title: string;
  author: string;
  status: Status;
  cover?: string;
  addedAt: string; 
}

export const STATUS_LABELS: Record<Status, string> = {
  want: "Хочу прочитать",
  reading: "Читаю",
  done: "Прочитано",
};
