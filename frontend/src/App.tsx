import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import RequireAuth from "./components/RequireAuth";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import LibraryPage from "./pages/LibraryPage";
import StatsPage from "./pages/StatsPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/library"
          element={
            <RequireAuth>
              <LibraryPage />
            </RequireAuth>
          }
        />
        <Route
          path="/stats"
          element={
            <RequireAuth>
              <StatsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        {/* Любой неизвестный адрес ведёт на главную */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
