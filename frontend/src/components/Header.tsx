import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  useLocation();
  
  const navigate = useNavigate();
  
  const isLoggedIn = Boolean(localStorage.getItem("auth_token"));

  function logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user"); 
    
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
        
        {isLoggedIn && (
          <>
            <NavLink to="/library">
              Моя библиотека
            </NavLink>
            <NavLink to="/statistics">
              Статистика
            </NavLink>
            <NavLink to="/profile">
              Профиль
            </NavLink>
          </>
        )}
        
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