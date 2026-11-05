import { useState } from "react";
import { isDemo, messageOf } from "../api/client";
import BookCard from "../components/BookCard";
import BookDialog from "../components/BookDialog";
import { useBooks } from "../hooks/useBooks";
import type { CoverChange } from "../hooks/useBooks";
import { todayStr } from "../lib/date";
import type { Book, BookInput, Status } from "../types";
import { STATUSES, STATUS_LABELS } from "../types";
import "./LibraryPage.css";

const EMPTY_TEXT: Record<Status, string> = {
  want_to_read: "Здесь будут книги, которые вы планируете прочитать.",
  reading: "Сейчас вы ничего не читаете. Начните с книги из списка «Хочу прочитать».",
  read: "Пока нет прочитанных книг.",
};

export default function LibraryPage() {
  const [tab, setTab] = useState<Status>("reading");
  const [year, setYear] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [notice, setNotice] = useState("");

  const activeYear = tab === "read" ? year : null;

  const { books, counts, years, loading, error, create, update, remove } = useBooks({
    status: tab,
    year: activeYear ?? undefined,
    sort_by: "created_at",
    order: "desc",
  });

  const shownYear = activeYear !== null && years.includes(activeYear) ? activeYear : null;

  async function handleSave(data: BookInput, cover: CoverChange) {
    const warning = editing ? await update(editing.id, data, cover) : await create(data, cover);
    setNotice(warning ?? "");
    setTab(data.status); 
  }

  async function handleMove(book: Book, target: Status) {
    const today = todayStr();
    const patch: Partial<BookInput> =
      target === "want_to_read"
        ? { status: target, start_date: null, finish_date: null, rating: null }
        : target === "reading"
          ? { status: target, start_date: book.start_date ?? today, finish_date: null, rating: null }
          : { status: target, finish_date: today };
    try {
      await update(book.id, patch);
      setTab(target);
      setNotice("");
    } catch (e) {
      setNotice(messageOf(e));
    }
  }

  async function handleDelete(book: Book) {
    if (!window.confirm(`Удалить «${book.title}» из библиотеки?`)) return;
    try {
      await remove(book.id);
      setNotice("");
    } catch (e) {
      setNotice(messageOf(e));
    }
  }

  const message = notice || error;

  return (
    <main className="container page">
      <div className="page__head">
        <h1>Моя библиотека</h1>
        <button type="button" className="btn btn--yellow" onClick={() => setCreating(true)}>
          + Добавить книгу
        </button>
      </div>

      {isDemo() && (
        <p className="mut">Демо-режим: данные хранятся только в этом браузере и не связаны с сервером.</p>
      )}

      {message && (
        <p className="lib-error" role="alert">
          {message}
        </p>
      )}

      <div className="lib-toolbar">
        <div className="lib-tabs" role="tablist" aria-label="Списки книг">
          {STATUSES.map((s) => (
            <button
              key={s}
              id={`tab-${s}`}
              type="button"
              role="tab"
              aria-selected={tab === s}
              aria-controls="lib-panel"
              className="lib-tab"
              onClick={() => setTab(s)}
            >
              {STATUS_LABELS[s]}
              <span className="lib-tab__count">{counts[s]}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === "read" && years.length > 0 && (
        <div className="chips" role="group" aria-label="Фильтр по году окончания">
          <button
            type="button"
            className={`chip${shownYear === null ? " chip--on" : ""}`}
            aria-pressed={shownYear === null}
            onClick={() => setYear(null)}
          >
            Все годы
          </button>
          {years.map((y) => (
            <button
              key={y}
              type="button"
              className={`chip${shownYear === y ? " chip--on" : ""}`}
              aria-pressed={shownYear === y}
              onClick={() => setYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      <div id="lib-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {loading ? (
          <p className="mut">Загрузка...</p>
        ) : books.length === 0 ? (
          <div className="empty">
            <h2>{STATUS_LABELS[tab]}: пусто</h2>
            <p>{EMPTY_TEXT[tab]}</p>
            <button type="button" className="btn btn--yellow" onClick={() => setCreating(true)}>
              Добавить книгу
            </button>
          </div>
        ) : (
          <div className="grid">
            {books.map((b) => (
              <BookCard 
                key={b.id} 
                book={b} 
                onEdit={setEditing} 
                onDelete={handleDelete} 
                onMove={handleMove} 
              />
            ))}
          </div>
        )}
      </div>

      {(creating || editing) && (
        <BookDialog
          book={editing ?? undefined}
          defaultStatus={tab}
          onSave={handleSave}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </main>
  );
}