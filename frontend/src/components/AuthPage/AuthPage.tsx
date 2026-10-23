import React, { useState, FormEvent } from 'react';
import './AuthPage.css';

type AuthMode = 'login' | 'register';

interface FormData {
  email: string;
  password: string;
  username?: string; 
}

interface FormErrors {
  email?: string;
  password?: string;
  username?: string;
  general?: string;
}

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    username: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidUsername = (username: string): boolean => {
    return username.length >= 3 && username.length <= 30;
  };

  const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Введите email';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (mode === 'register') {
      if (!formData.username) {
        newErrors.username = 'Введите имя пользователя';
      } else if (!isValidUsername(formData.username)) {
        newErrors.username = 'Имя должно быть от 3 до 30 символов';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      //эмулируем запрос
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // фейковый токен
      const fakeToken = 'test_token_' + Date.now();
      localStorage.setItem('auth_token', fakeToken);
      
      console.log('Успешный вход/регистрация:', formData);
      
      alert('Успешно! Токен сохранён в localStorage');
    } catch (error) {
      setErrors({ general: 'Неверный email или пароль' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setFormData({ email: '', password: '', username: '' });
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="logo">
          <img src="/assets/book-shelf-fill.svg" alt="Book icon" className="logo-icon" />
          <span className="logo-text">Book Tracker</span>
        </div>
        <a href="/" className="main-link">Главная</a>
      </header>

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
            {/* Username*/}
            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="username">Имя пользователя</label>
                <input
                  id="username"
                  type="text"
                  placeholder="your_username"
                  value={formData.username || ''}
                  onChange={handleChange('username')}
                  className={errors.username ? 'error' : ''}
                />
                {errors.username && (
                  <span className="field-error">{errors.username}</span>
                )}
              </div>
            )}

            {/*Email*/}
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
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>

            {/*Password*/}
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
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </div>

            {errors.general && (
              <div className="general-error">{errors.general}</div>
            )}

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>

            {mode === 'login' && (
              <a href="/forgot-password" className="forgot-link">
                Забыли пароль?
              </a>
            )}
            <span className="star-bottom-inline">✦</span>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;