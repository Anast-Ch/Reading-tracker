/** ДЕМО-РЕЖИМ: профиль хранится в браузере. */
import { ApiError } from "./client";
import type { User, UserPatch } from "./userApi";

const KEY = "reading-tracker:demo-user";
const DEMO_BOOKS_KEY = "reading-tracker:demo-books"; // тот же ключ, что в booksMock.ts
const DEFAULT_USER: User = { id: 1, email: "demo@example.com", name: null };

function read(): User {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export async function getMe(): Promise<User> {
  return read();
}

export async function updateMe(patch: UserPatch): Promise<User> {
  const user = { ...read() };
  if (patch.name !== undefined) user.name = patch.name;
  if (patch.email !== undefined) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patch.email)) throw new ApiError(422, "Некорректный email");
    user.email = patch.email;
  }
  localStorage.setItem(KEY, JSON.stringify(user));
  return user;
}

export async function changePassword(current: string, next: string): Promise<void> {
  // У демо-пользователя пароля нет, принимаем любой непустой текущий
  if (!current) throw new ApiError(400, "Неверный текущий пароль");
  if (next.length < 8) throw new ApiError(422, "Пароль: от 8 символов, не более 72 байт");
}

export async function deleteMe(): Promise<void> {
  localStorage.removeItem(KEY);
  localStorage.removeItem(DEMO_BOOKS_KEY);
}
