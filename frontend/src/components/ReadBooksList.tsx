import type { Book } from "../types";
import { formatDate } from "../lib/date";
import BookCover from "./BookCover";
import StarRating from "./StarRating";

/** Список прочитанных за период книг */
export default function ReadBooksList({ books }: { books: Book[] }) {
  return (
    <section className="panel">
      <h2>Прочитано за период</h2>
      <ul className="read-list">
        {books.map((b) => (
          <li className="read-item" key={b.id}>
            <div className="read-item__cover">
              <BookCover book={b} />
            </div>
            <div>
              <p className="read-item__title">{b.title}</p>
              <p className="mut">{b.author}</p>
            </div>
            {b.rating ? <StarRating value={b.rating} /> : <span className="mut">без оценки</span>}
            <span className="mut">{formatDate(b.finish_date)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
