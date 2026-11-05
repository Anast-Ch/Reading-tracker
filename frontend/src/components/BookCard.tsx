import type { Book } from "../types";
import { formatDate } from "../lib/date";
import BookCover from "./BookCover";
import StarRating from "./StarRating";

interface Props {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onAdvance: (book: Book) => void;
}

export default function BookCard({ book, onEdit, onDelete, onAdvance }: Props) {
  const details = [book.publish_year, book.pages_count ? `${book.pages_count} стр.` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="book-card">
      <BookCover book={book} />
      <div className="book-card__body">
        <h3 className="book-card__title">{book.title}</h3>
        <p className="book-card__author">{book.author}</p>
        {details && <p className="mut">{details}</p>}

        <p className="mut">
          {book.status === "want_to_read" && `Добавлена: ${formatDate(book.created_at)}`}
          {book.status === "reading" &&
            (book.start_date ? `Начата: ${formatDate(book.start_date)}` : "Дата начала не указана")}
          {book.status === "read" && `Прочитана: ${formatDate(book.finish_date)}`}
        </p>
        {book.status === "read" && book.rating ? <StarRating value={book.rating} /> : null}
      </div>

      <div className="book-card__actions">
        {book.status === "want_to_read" && (
          <button type="button" className="btn btn--blue btn--small" onClick={() => onAdvance(book)}>
            Начал читать
          </button>
        )}
        {book.status === "reading" && (
          <button type="button" className="btn btn--blue btn--small" onClick={() => onAdvance(book)}>
            Прочитано
          </button>
        )}
        
        <div className="book-card__icon-buttons">
          <button 
            type="button" 
            className="btn btn--ghost btn--icon" 
            onClick={() => onEdit(book)}
            title="Изменить"
            aria-label="Изменить"
          >
            ✎
          </button>
          <button 
            type="button" 
            className="btn btn--ghost btn--icon btn--icon-danger" 
            onClick={() => onDelete(book)}
            title="Удалить"
            aria-label="Удалить"
          >
            🗑
          </button>
        </div>
      </div>
    </article>
  );
}
