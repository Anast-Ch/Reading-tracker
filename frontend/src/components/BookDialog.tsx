import { useEffect, useRef, useState } from "react";
import { coverUrl } from "../api/booksApi";
import { messageOf } from "../api/client";
import type { CoverChange } from "../hooks/useBooks";
import type { Book, BookInput, Status } from "../types";
import { STATUSES, STATUS_LABELS } from "../types";
import { todayStr } from "../lib/date";
import { validateCover } from "../lib/image";
import StarRating from "./StarRating";

interface Props {
  book?: Book;
  defaultStatus: Status;
  onSave: (data: BookInput, cover: CoverChange) => Promise<void>;
  onClose: () => void;
}

const isPositiveInt = (s: string) => /^\d+$/.test(s) && Number(s) > 0;
const toNumber = (s: string) => (s.trim() === "" ? null : Number(s));

export default function BookDialog({ book, defaultStatus, onSave, onClose }: Props) {
  const today = todayStr();
  const initStatus = book?.status ?? defaultStatus;

  const [title, setTitle] = useState(book?.title ?? "");
  const [author, setAuthor] = useState(book?.author ?? "");
  const [publishYear, setPublishYear] = useState(book?.publish_year?.toString() ?? "");
  const [pages, setPages] = useState(book?.pages_count?.toString() ?? "");
  const [status, setStatus] = useState<Status>(initStatus);
  const [startDate, setStartDate] = useState(book?.start_date ?? (initStatus === "reading" ? today : ""));
  const [finishDate, setFinishDate] = useState(book?.finish_date ?? (initStatus === "read" ? today : ""));
  const [rating, setRating] = useState<number | null>(book?.rating ?? null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | undefined>(coverUrl(book?.cover_path));
  const [coverRemoved, setCoverRemoved] = useState(false);
  const [coverError, setCoverError] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const blobUrl = useRef<string | null>(null);

  useEffect(() => () => {
    if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
  }, []);

  function changeStatus(s: Status) {
    setStatus(s);
    if (s === "reading" && !startDate) setStartDate(today);
    if (s === "read" && !finishDate) setFinishDate(today);
  }

  function handleFile(file?: File) {
    if (!file) return;
    const problem = validateCover(file);
    if (problem) {
      setCoverError(problem);
      return;
    }
    setCoverError("");
    if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    blobUrl.current = URL.createObjectURL(file);
    setCoverFile(file);
    setCoverPreview(blobUrl.current);
    setCoverRemoved(false);
  }

  function removeCover() {
    setCoverFile(null);
    setCoverPreview(undefined);
    setCoverRemoved(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Введите название";
    if (!author.trim()) e.author = "Введите автора";
    if (publishYear.trim() && !isPositiveInt(publishYear.trim())) e.publishYear = "Введите год числом";
    if (pages.trim() && !isPositiveInt(pages.trim())) e.pages = "Введите число больше нуля";
    if (status !== "want_to_read" && startDate && startDate > today) {
      e.startDate = "Дата начала не может быть в будущем";
    }
    if (status === "read") {
      if (!finishDate) e.finishDate = "Укажите дату окончания";
      else if (finishDate > today) e.finishDate = "Дата окончания не может быть в будущем";
      else if (startDate && finishDate < startDate) e.finishDate = "Дата окончания раньше даты начала";
    }
    return e;
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length > 0) return;

    const data: BookInput = {
      title: title.trim(),
      author: author.trim(),
      publish_year: toNumber(publishYear),
      pages_count: toNumber(pages),
      status,
      start_date: status === "want_to_read" ? null : startDate || null,
      finish_date: status === "read" ? finishDate : null,
      rating: status === "read" ? rating : null,
    };
    const cover: CoverChange = coverFile ? { file: coverFile } : coverRemoved && book?.cover_path ? { remove: true } : {};

    setSaving(true);
    try {
      await onSave(data, cover);
      onClose();
    } catch (err) {
      setServerError(messageOf(err));
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <form
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        noValidate
      >
        <h2 id="dialog-title">{book ? "Редактировать книгу" : "Новая книга"}</h2>

        <label className="field">
          Название
          <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          {errors.title && <span className="field__error">{errors.title}</span>}
        </label>

        <label className="field">
          Автор
          <input value={author} onChange={(e) => setAuthor(e.target.value)} />
          {errors.author && <span className="field__error">{errors.author}</span>}
        </label>

        <label className="field">
          Год издания (необязательно)
          <input inputMode="numeric" value={publishYear} onChange={(e) => setPublishYear(e.target.value)} />
          {errors.publishYear && <span className="field__error">{errors.publishYear}</span>}
        </label>

        <label className="field">
          Количество страниц (необязательно)
          <input inputMode="numeric" value={pages} onChange={(e) => setPages(e.target.value)} />
          {errors.pages && <span className="field__error">{errors.pages}</span>}
        </label>

        <label className="field">
          Список
          <select value={status} onChange={(e) => changeStatus(e.target.value as Status)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>

        {status !== "want_to_read" && (
          <label className="field">
            Дата начала
            <input type="date" max={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            {errors.startDate && <span className="field__error">{errors.startDate}</span>}
          </label>
        )}

        {status === "read" && (
          <label className="field">
            Дата окончания
            <input type="date" max={today} value={finishDate} onChange={(e) => setFinishDate(e.target.value)} />
            {errors.finishDate && <span className="field__error">{errors.finishDate}</span>}
          </label>
        )}

        <div className="field">
          Оценка
          <StarRating
            value={rating}
            onChange={(n) => setRating(n === rating ? null : n)}
            disabled={status !== "read"}
          />
          {status !== "read" && (
            <span className="mut">
              {book?.rating
                ? "Оценка будет сброшена, пока книга не в списке «Прочитано»"
                : "Оценить можно после прочтения"}
            </span>
          )}
        </div>

        <div className="field">
          Обложка (необязательно)
          <div className="cover-upload">
            {coverPreview ? (
              <img className="cover cover--preview" src={coverPreview} alt="Выбранная обложка" />
            ) : (
              <div className="cover cover--preview cover--empty" aria-hidden="true">
                ?
              </div>
            )}
            <div className="cover-upload__actions">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <button type="button" className="btn btn--blue btn--small" onClick={() => fileRef.current?.click()}>
                {coverPreview ? "Заменить" : "Загрузить файл"}
              </button>
              {coverPreview && (
                <button type="button" className="btn btn--ghost btn--small" onClick={removeCover}>
                  Убрать
                </button>
              )}
              <span className="mut">JPG, PNG или WebP, до 2 МБ</span>
              {coverError && <span className="field__error">{coverError}</span>}
            </div>
          </div>
        </div>

        {serverError && (
          <p className="field__error" role="alert">
            {serverError}
          </p>
        )}

        <div className="dialog__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn--yellow" disabled={saving}>
            {saving ? "Сохранение..." : book ? "Сохранить" : "Добавить книгу"}
          </button>
        </div>
      </form>
    </div>
  );
}
