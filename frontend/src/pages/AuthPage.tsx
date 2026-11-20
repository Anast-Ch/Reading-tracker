import { useState, type ChangeEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { login, register } from '../api/authApi';
import { DEMO_TOKEN, TOKEN_KEY, messageOf } from '../api/client';
import './AuthPage.css';

type AuthMode = 'login' | 'register';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const PASSWORD_MIN = 8; 
const PASSWORD_MAX_BYTES = 72; 

const AuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);

  if (localStorage.getItem(TOKEN_KEY)) {
    return <Navigate to="/library" replace />;
  }

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Введите email';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (
      mode === 'register' &&
      (formData.password.length < PASSWORD_MIN ||
        new TextEncoder().encode(formData.password).length > PASSWORD_MAX_BYTES)
    ) {
      newErrors.password = `Пароль: от ${PASSWORD_MIN} символов, не более ${PASSWORD_MAX_BYTES} символов`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    const email = formData.email.trim();
    try {
      if (mode === 'register') {
        await register(email, formData.password); 
      }
      const token = await login(email, formData.password);
      localStorage.setItem(TOKEN_KEY, token);
      navigate('/library');
    } catch (error) {
      setErrors({ general: messageOf(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setFormData({ email: '', password: '' });
    setShowPassword(false); 
  };

  return (
    <div className="auth-page">
      <main className="auth-content">
        <div className="background-image">
          <img src="/assets/cat.jpg" alt="Cat with books" />
        </div>

        <div className={`form-card ${mode === 'login' ? 'login-mode' : 'register-mode'}`}>
          <span className="star star-top">✦</span>
          <span className="star star-bottom">✦</span>

          <div className="tabs">
            <button
              type="button"
              className={`tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Вход
            </button>
            <button
              type="button"
              className={`tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Регистрация
            </button>
          </div>

          <h2 className="form-title">
            {mode === 'login' ? 'С возвращением!' : 'Добро пожаловать!'}
          </h2>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="somebody@example.com"
                value={formData.email}
                onChange={handleChange('email')}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange('password')}
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {errors.general && <div className="general-error">{errors.general}</div>}

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>

            {/* Демо-вход */}
            <button
              type="button"
              className="forgot-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px' }}
              onClick={() => {
                localStorage.setItem(TOKEN_KEY, DEMO_TOKEN);
                navigate('/library');
              }}
            >
              Демо-вход без пароля
            </button>

            <span className="star-bottom-inline">✦</span>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;