import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { TOKEN_KEY } from "../api/client";
import "./Header.css";

export default function Header() {
  // Нужен, чтобы шапка перерисовывалась при смене страницы
  // и пункты меню всегда соответствовали состоянию входа.
  useLocation();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem(TOKEN_KEY));

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    navigate("/");
  }

  return (
    <header className="site-header">
      <Link to="/" className="site-logo">
        <img src="/assets/book-shelf-fill.svg" alt="" className="site-logo__icon" />
        <span className="site-logo__text">Book Tracker</span>
      </Link>

      <nav className="site-nav" aria-label="Основная навигация">
        <NavLink to="/" end>
          Главная
        </NavLink>
        {isLoggedIn && <NavLink to="/library">Моя библиотека</NavLink>}
        {isLoggedIn && <NavLink to="/stats">Статистика</NavLink>}
        {isLoggedIn && <NavLink to="/profile">Профиль</NavLink>}
        {isLoggedIn ? (
          <button type="button" className="site-nav__btn" onClick={logout}>
            Выйти
          </button>
        ) : (
          <NavLink to="/auth">Войти</NavLink>
        )}
      </nav>
    </header>
  );
}
