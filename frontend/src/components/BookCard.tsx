import { useEffect, useRef, useState } from "react";
import type { Book, Status } from "../types";
import { STATUSES, STATUS_LABELS } from "../types";
import { formatDate } from "../lib/date";
import BookCover from "./BookCover";
import StarRating from "./StarRating";
import "./BookCard.css";

interface Props {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onMove: (book: Book, target: Status) => void;
}

export default function BookCard({ book, onEdit, onDelete, onMove }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    wrapRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();

    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(action: () => void) {
    setOpen(false);
    action();
  }

  const otherStatuses = STATUSES.filter((s) => s !== book.status);
  const details = [book.publish_year, book.pages_count ? `${book.pages_count} стр.` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="book-card">
      <BookCover book={book} />

      <div className="card-menu" ref={wrapRef}>
        <button
          ref={buttonRef}
          type="button"
          className="card-menu__btn"
          aria-label={`Действия с книгой «${book.title}»`}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          ⋮
        </button>

        {open && (
          <div className="card-menu__list" role="menu">
            {otherStatuses.map((s) => (
              <button
                key={s}
                type="button"
                role="menuitem"
                className="card-menu__item"
                onClick={() => choose(() => onMove(book, s))}
              >
                Добавить в «{STATUS_LABELS[s]}»
              </button>
            ))}
            <div className="card-menu__sep" role="separator" />
            <button type="button" role="menuitem" className="card-menu__item" onClick={() => choose(() => onEdit(book))}>
              Изменить
            </button>
            <button
              type="button"
              role="menuitem"
              className="card-menu__item card-menu__item--danger"
              onClick={() => choose(() => onDelete(book))}
            >
              Удалить
            </button>
          </div>
        )}
      </div>

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
    </article>
  );
}
