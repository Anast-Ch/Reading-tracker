import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TOKEN_KEY, isDemo, messageOf } from "../api/client";
import { changePassword, deleteMe, getMe, updateMe } from "../api/userApi";
import type { User, UserPatch } from "../api/userApi";
import "./ProfilePage.css";

interface Message {
  ok: boolean;
  text: string;
}

const PASSWORD_MIN = 8; // символов
const PASSWORD_MAX_BYTES = 72; // байт в UTF-8 (кириллица занимает 2 байта на символ)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loadError, setLoadError] = useState("");

  // Форма «Данные»
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileMsg, setProfileMsg] = useState<Message | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Форма «Пароль»
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [repeatPw, setRepeatPw] = useState("");
  const [pwMsg, setPwMsg] = useState<Message | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  // Удаление аккаунта
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    getMe()
      .then((u) => {
        setUser(u);
        setName(u.name ?? "");
        setEmail(u.email);
      })
      .catch((e) => setLoadError(messageOf(e)));
  }, []);

  async function handleProfileSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!user) return;
    setProfileMsg(null);

    const newName = name.trim() === "" ? null : name.trim();
    const newEmail = email.trim();
    if (newName && newName.length > 150) return setProfileMsg({ ok: false, text: "Имя: не длиннее 150 символов" });
    if (!EMAIL_RE.test(newEmail)) return setProfileMsg({ ok: false, text: "Некорректный email" });

    // Отправляем только то, что изменилось
    const patch: UserPatch = {};
    if (newName !== user.name) patch.name = newName;
    if (newEmail !== user.email) patch.email = newEmail;
    if (Object.keys(patch).length === 0) return setProfileMsg({ ok: true, text: "Изменений нет" });

    setSavingProfile(true);
    try {
      const updated = await updateMe(patch);
      setUser(updated);
      setName(updated.name ?? "");
      setEmail(updated.email);
      setProfileMsg({ ok: true, text: "Изменения сохранены" });
    } catch (err) {
      setProfileMsg({ ok: false, text: messageOf(err) });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setPwMsg(null);

    if (!currentPw) return setPwMsg({ ok: false, text: "Введите текущий пароль" });
    if (newPw.length < PASSWORD_MIN || new TextEncoder().encode(newPw).length > PASSWORD_MAX_BYTES) {
      return setPwMsg({
        ok: false,
        text: `Новый пароль: от ${PASSWORD_MIN} символов, не более ${PASSWORD_MAX_BYTES} байт (кириллица занимает 2 байта на символ)`,
      });
    }
    if (newPw !== repeatPw) return setPwMsg({ ok: false, text: "Пароли не совпадают" });

    setSavingPw(true);
    try {
      await changePassword(currentPw, newPw);
      setCurrentPw("");
      setNewPw("");
      setRepeatPw("");
      setPwMsg({ ok: true, text: "Пароль изменён" });
    } catch (err) {
      setPwMsg({ ok: false, text: messageOf(err) });
    } finally {
      setSavingPw(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    navigate("/");
  }

  async function handleDelete() {
    setDeleteError("");
    try {
      await deleteMe();
      localStorage.removeItem(TOKEN_KEY);
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteError(messageOf(err));
    }
  }

  if (loadError) {
    return (
      <main className="container page">
        <h1>Профиль</h1>
        <p className="form-msg form-msg--err" role="alert">
          {loadError}
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container page">
        <h1>Профиль</h1>
        <p className="mut">Загрузка...</p>
      </main>
    );
  }

  const initial = (user.name ?? user.email).charAt(0).toUpperCase();

  return (
    <main className="container page">
      <h1>Профиль</h1>

      {isDemo() && <p className="mut">Демо-режим: данные профиля хранятся только в этом браузере.</p>}

      <section className="profile-summary">
        <div className="avatar" aria-hidden="true">
          {initial}
        </div>
        <div>
          <p className="profile-summary__name">{user.name ?? "Имя не задано"}</p>
          <p className="mut">{user.email}</p>
        </div>
        <button type="button" className="btn btn--ghost profile-summary__logout" onClick={logout}>
          Выйти
        </button>
      </section>

      <div className="profile-grid">
        <form className="profile-card" onSubmit={handleProfileSubmit} noValidate>
          <h2>Данные</h2>
          <label className="field">
            Имя
            <input value={name} maxLength={150} onChange={(e) => setName(e.target.value)} placeholder="Как к вам обращаться" />
          </label>
          <label className="field">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {profileMsg && (
            <p role="status" className={`form-msg ${profileMsg.ok ? "form-msg--ok" : "form-msg--err"}`}>
              {profileMsg.text}
            </p>
          )}
          <button type="submit" className="btn btn--yellow profile-card__btn" disabled={savingProfile}>
            {savingProfile ? "Сохранение..." : "Сохранить"}
          </button>
        </form>

        <form className="profile-card" onSubmit={handlePasswordSubmit} noValidate>
          <h2>Смена пароля</h2>
          <label className="field">
            Текущий пароль
            <input type="password" autoComplete="current-password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          </label>
          <label className="field">
            Новый пароль
            <input type="password" autoComplete="new-password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </label>
          <label className="field">
            Повторите новый пароль
            <input type="password" autoComplete="new-password" value={repeatPw} onChange={(e) => setRepeatPw(e.target.value)} />
          </label>
          {pwMsg && (
            <p role="status" className={`form-msg ${pwMsg.ok ? "form-msg--ok" : "form-msg--err"}`}>
              {pwMsg.text}
            </p>
          )}
          <button type="submit" className="btn btn--blue profile-card__btn" disabled={savingPw}>
            {savingPw ? "Сохранение..." : "Изменить пароль"}
          </button>
        </form>
      </div>

      <section className="profile-card profile-card--danger">
        <h2>Удаление аккаунта</h2>
        <p>Аккаунт будет удалён вместе со всеми книгами и обложками. Это необратимо.</p>
        {confirmDelete ? (
          <div className="profile-actions">
            <button type="button" className="btn btn--danger" onClick={handleDelete}>
              Да, удалить навсегда
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setConfirmDelete(false)}>
              Отмена
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn--ghost profile-card__btn" onClick={() => setConfirmDelete(true)}>
            Удалить аккаунт
          </button>
        )}
        {deleteError && (
          <p role="alert" className="form-msg form-msg--err">
            {deleteError}
          </p>
        )}
      </section>
    </main>
  );
}
