import { isDemo, request } from "./client";
import * as mock from "./userMock";

export interface User {
  id: number;
  email: string;
  name: string | null;
}

export interface UserPatch {
  name?: string | null; 
  email?: string;
}

export const getMe = (): Promise<User> => (isDemo() ? mock.getMe() : request<User>("/users/me"));

export const updateMe = (patch: UserPatch): Promise<User> =>
  isDemo() ? mock.updateMe(patch) : request<User>("/users/me", { method: "PATCH", body: patch });

export const changePassword = (current_password: string, new_password: string): Promise<void> =>
  isDemo()
    ? mock.changePassword(current_password, new_password)
    : request<void>("/users/me/password", { method: "PATCH", body: { current_password, new_password } });

export const deleteMe = (): Promise<void> =>
  isDemo() ? mock.deleteMe() : request<void>("/users/me", { method: "DELETE" });
