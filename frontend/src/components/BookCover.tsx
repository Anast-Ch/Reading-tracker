import type { Book } from "../types";

const PLACEHOLDER_COLORS = ["#FFD229", "#FFCFE1", "#E9F153", "#42B3E8"];

function colorFor(text: string) {
  let hash = 0;
  for (const ch of text) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return PLACEHOLDER_COLORS[hash % PLACEHOLDER_COLORS.length];
}

interface Props {
  book: Pick<Book, "title" | "cover">;
}

/** Обложка пользователя или цветная заглушка с первой буквой названия. */
export default function BookCover({ book }: Props) {
  if (book.cover) {
    return <img className="cover" src={book.cover} alt={`Обложка: ${book.title}`} />;
  }
  return (
    <div
      className="cover cover--empty"
      style={{ background: colorFor(book.title) }}
      aria-hidden="true"
    >
      {book.title.trim().charAt(0).toUpperCase()}
    </div>
  );
}
