import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const isLoggedIn = Boolean(localStorage.getItem("auth_token"));
  return isLoggedIn ? <>{children}</> : <Navigate to="/auth" replace />;
}
