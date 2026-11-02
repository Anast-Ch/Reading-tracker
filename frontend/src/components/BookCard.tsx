import type { Book } from "../types";
import { STATUS_LABELS } from "../types";
import BookCover from "./BookCover";

interface Props {
  book: Book;
  onRemove: (id: string) => void;
}

export default function BookCard({ book, onRemove }: Props) {
  return (
    <article className="book-card">
      <BookCover book={book} />
      <div className="book-card__body">
        <h3 className="book-card__title">{book.title}</h3>
        <p className="book-card__author">{book.author}</p>
        <span className={`badge badge--${book.status}`}>{STATUS_LABELS[book.status]}</span>
      </div>
      <button
        type="button"
        className="btn btn--ghost btn--small"
        onClick={() => {
          if (window.confirm(`Удалить «${book.title}» из библиотеки?`)) onRemove(book.id);
        }}
      >
        Удалить
      </button>
    </article>
  );
}
