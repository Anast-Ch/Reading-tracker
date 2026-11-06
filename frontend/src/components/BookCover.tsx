import { coverUrl } from "../api/booksApi";
import type { Book } from "../types";

const PLACEHOLDER_COLORS = ['#CAEDB8', '#56694F', '#963F2E', '#FC8A2D', '#3D1534', '#9E9820', '#F0C283', '#5D6973', '#CF6E6C', '#DCA7A1',
    '#F39BB3', '#A7F3F3', '#8AA68F', '#D4D973', '#BF9177', '#B26565',];

function colorFor(text: string) {
  let hash = 0;
  for (const ch of text) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return PLACEHOLDER_COLORS[hash % PLACEHOLDER_COLORS.length];
}

interface Props {
  book: Pick<Book, "title" | "cover_path">;
}

export default function BookCover({ book }: Props) {
  const src = coverUrl(book.cover_path);
  if (src) {
    return <img className="cover" src={src} alt={`Обложка: ${book.title}`} />;
  }
  return (
    <div className="cover cover--empty" style={{ background: colorFor(book.title) }} aria-hidden="true">
      {book.title.trim().charAt(0).toUpperCase()}
    </div>
  );
}
