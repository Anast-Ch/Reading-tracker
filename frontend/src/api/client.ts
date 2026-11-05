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

function detailToMessage(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const fields = detail
      .map((d) => (Array.isArray(d?.loc) ? d.loc.join(".") : ""))
      .join(" ");
    if (fields.includes("email")) return "Некорректный email";
    if (fields.includes("password")) return "Пароль должен быть от 8 до 72 символов";
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
