import { useRef, useState } from "react";
import type { SubmitEvent } from "react";
import type { Book, Status } from "../types";
import { STATUS_LABELS } from "../types";
import { fileToCover } from "../lib/image";

interface Props {
  onAdd: (data: Omit<Book, "id" | "addedAt">) => void;
  onClose: () => void;
}

export default function AddBookDialog({ onAdd, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<Status>("want");
  const [cover, setCover] = useState<string | undefined>();
  const [coverError, setCoverError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file?: File) {
    if (!file) return;
    setCoverError("");
    try {
      setCover(await fileToCover(file));
    } catch (e) {
      setCoverError(e instanceof Error ? e.message : "Не удалось загрузить обложку");
    }
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    if (!title.trim() || !author.trim()) return;
    onAdd({ title: title.trim(), author: author.trim(), status, cover });
    onClose();
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
        <h2 id="dialog-title">Новая книга</h2>

        <label className="field">
          Название
          <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          {submitted && !title.trim() && <span className="field__error">Введите название</span>}
        </label>

        <label className="field">
          Автор
          <input value={author} onChange={(e) => setAuthor(e.target.value)} />
          {submitted && !author.trim() && <span className="field__error">Введите автора</span>}
        </label>

        <label className="field">
          Список
          <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>

        <div className="field">
          Обложка (необязательно)
          <div className="cover-upload">
            {cover ? (
              <img className="cover cover--preview" src={cover} alt="Выбранная обложка" />
            ) : (
              <div className="cover cover--preview cover--empty" aria-hidden="true">
                ?
              </div>
            )}
            <div className="cover-upload__actions">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <button type="button" className="btn btn--blue btn--small" onClick={() => fileRef.current?.click()}>
                {cover ? "Заменить" : "Загрузить файл"}
              </button>
              {cover && (
                <button
                  type="button"
                  className="btn btn--ghost btn--small"
                  onClick={() => {
                    setCover(undefined);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  Убрать
                </button>
              )}
              {coverError && <span className="field__error">{coverError}</span>}
            </div>
          </div>
        </div>

        <div className="dialog__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn--yellow">
            Добавить книгу
          </button>
        </div>
      </form>
    </div>
  );
}
