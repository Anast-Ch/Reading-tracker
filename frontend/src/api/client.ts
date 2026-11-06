export const BASE_URL: string = import.meta.env.VITE_API_URL ?? "/api";
export const TOKEN_KEY = "auth_token";

export const DEMO_TOKEN = "demo_token";
export const isDemo = () => localStorage.getItem(TOKEN_KEY) === DEMO_TOKEN;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const messageOf = (e: unknown): string =>
  e instanceof Error ? e.message : "Что-то пошло не так";

const FIELD_MESSAGES: Record<string, string> = {
  email: "Некорректный email",
  password: "Пароль: от 8 символов, не более 72 байт (кириллица занимает 2 байта на символ)",
  new_password: "Пароль: от 8 символов, не более 72 байт (кириллица занимает 2 байта на символ)",
  title: "Название: от 1 до 500 символов",
  author: "Автор: от 1 до 300 символов",
  publish_year: "Год издания: число от 1 до 9999",
  pages_count: "Количество страниц: число от 1 до 100000",
  rating: "Оценка: от 1 до 5",
  start_date: "Некорректная дата начала",
  finish_date: "Некорректная дата окончания",
  file: "Не выбран файл",
};

function detailToMessage(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    for (const d of detail) {
      const field = Array.isArray(d?.loc) ? String(d.loc[d.loc.length - 1]) : "";
      if (FIELD_MESSAGES[field]) return FIELD_MESSAGES[field];
    }
  }
  return "Проверьте введённые данные";
}

interface Options {
  method?: string;
  body?: unknown;
  form?: FormData; 
  auth?: boolean;
}

export async function request<T>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const withAuth = opts.auth !== false;

  if (withAuth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;
  if (opts.form) {
    body = opts.form;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  let res: Response;
  try {
    res = await fetch(BASE_URL + path, { method: opts.method ?? "GET", headers, body });
  } catch {
    throw new ApiError(0, "Нет связи с сервером. Проверьте, что бэкенд запущен");
  }

  if (res.status === 401 && withAuth) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.assign("/auth");
    throw new ApiError(401, "Сессия истекла, войдите снова");
  }

  if (!res.ok) {
    let message = "Что-то пошло не так";
    try {
      const data = await res.json();
      message = detailToMessage(data.detail);
    } catch {
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
