import { useState } from 'react';
import type { ChangeEvent } from 'react';
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
const PASSWORD_MAX = 72;

const AuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

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
      (formData.password.length < PASSWORD_MIN || formData.password.length > PASSWORD_MAX)
    ) {
      newErrors.password = `Пароль должен быть от ${PASSWORD_MIN} до ${PASSWORD_MAX} символов`;
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

          <h2 className="form-title">{mode === 'login' ? 'С возвращением!' : 'Добро пожаловать!'}</h2>

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
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange('password')}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {errors.general && <div className="general-error">{errors.general}</div>}

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>

            <button
              type="button"
              className="forgot-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
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
