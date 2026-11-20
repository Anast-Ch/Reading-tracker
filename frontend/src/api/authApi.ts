import { request } from "./client";

export async function register(email: string, password: string): Promise<void> {
  await request("/auth/register", { method: "POST", body: { email, password }, auth: false });
}

export async function login(email: string, password: string): Promise<string> {
  const res = await request<{ access_token: string }>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  return res.access_token;
}
