import { useState } from "react";
import { isDemo, messageOf } from "../api/client";
import BookCard from "../components/BookCard";
import BookDialog from "../components/BookDialog";
import { useBooks } from "../hooks/useBooks";
import type { CoverChange } from "../hooks/useBooks";
import { todayStr } from "../lib/date";
import type { Book, BookInput, SortBy, Status } from "../types";
import { STATUSES, STATUS_LABELS } from "../types";
import "./LibraryPage.css";

type SortKey = "new" | "start" | "finish" | "title" | "author";

const SORTS: Record<SortKey, { label: string; sort_by: SortBy; order: "asc" | "desc" }> = {
  new: { label: "Сначала новые", sort_by: "created_at", order: "desc" },
  start: { label: "По дате начала", sort_by: "start_date", order: "desc" },
  finish: { label: "По дате окончания", sort_by: "finish_date", order: "desc" },
  title: { label: "По названию", sort_by: "title", order: "asc" },
  author: { label: "По автору", sort_by: "author", order: "asc" },
};

const SORTS_FOR_TAB: Record<Status, SortKey[]> = {
  want_to_read: ["new", "title", "author"],
  reading: ["new", "start", "title", "author"],
  read: ["new", "finish", "start", "title", "author"],
};

const EMPTY_TEXT: Record<Status, string> = {
  want_to_read: "Здесь будут книги, которые вы планируете прочитать.",
  reading: "Сейчас вы ничего не читаете. Начните с книги из списка «Хочу прочитать».",
  read: "Пока нет прочитанных книг.",
};

export default function LibraryPage() {
  const [tab, setTab] = useState<Status>("reading");
  const [sort, setSort] = useState<SortKey>("new");
  const [year, setYear] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [notice, setNotice] = useState("");

  const sortKey = SORTS_FOR_TAB[tab].includes(sort) ? sort : "new";
  const { sort_by, order } = SORTS[sortKey];

  const activeYear = tab === "read" ? year : null;

  const { books, counts, years, loading, error, create, update, remove } = useBooks({
    status: tab,
    year: activeYear ?? undefined,
    sort_by,
    order,
  });

  const shownYear = activeYear !== null && years.includes(activeYear) ? activeYear : null;

  async function handleSave(data: BookInput, cover: CoverChange) {
    const warning = editing ? await update(editing.id, data, cover) : await create(data, cover);
    setNotice(warning ?? "");
    setTab(data.status); 
  }

  async function handleAdvance(book: Book) {
    const today = todayStr();
    try {
      if (book.status === "want_to_read") {
        await update(book.id, { status: "reading", start_date: today });
        setTab("reading");
      } else if (book.status === "reading") {
        await update(book.id, { status: "read", finish_date: today });
        setTab("read");
      }
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

        <label className="lib-sort">
          Сортировка
          <select value={sortKey} onChange={(e) => setSort(e.target.value as SortKey)}>
            {SORTS_FOR_TAB[tab].map((k) => (
              <option key={k} value={k}>
                {SORTS[k].label}
              </option>
            ))}
          </select>
        </label>
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
              <BookCard key={b.id} book={b} onEdit={setEditing} onDelete={handleDelete} onAdvance={handleAdvance} />
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
