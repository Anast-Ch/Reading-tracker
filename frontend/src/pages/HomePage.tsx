import { Link } from "react-router-dom";
import "./HomePage.css";

const features = [
  { title: "Три списка", text: "Хочу прочитать, читаю и прочитано. Каждая книга лежит на своей полке.", color: "var(--pink)" },
  { title: "Свои книги и обложки", text: "Введите название и автора, а обложку загрузите из файла.", color: "var(--lime)" },
  { title: "Даты и оценки", text: "Отмечайте даты вручную, в том числе задним числом. Оценка от 1 до 5 для прочитанного.", color: "var(--blue)" },
  { title: "Статистика", text: "Сколько книг прочитано и какая средняя оценка за месяц, сезон или год.", color: "var(--yellow)" },
];

const steps = [
  { title: "Зарегистрируйтесь", text: "Достаточно email и пароля." },
  { title: "Добавьте книгу", text: "Впишите название и автора, выберите список." },
  { title: "Следите за чтением", text: "Меняйте статус, ставьте оценки и смотрите итоги." },
];

export default function HomePage() {
  const target = localStorage.getItem("auth_token") ? "/library" : "/auth";
  return (
    <main>
      <section className="container hero">
        <div className="hero__text">
          <h1>Все ваши книги в одном месте</h1>
          <p>
            Ведите списки, отмечайте, что читаете сейчас, и смотрите статистику по месяцам, сезонам и годам.
          </p>
          <div className="hero__actions">
            <Link to={target} className="btn btn--yellow btn--big">
              Открыть библиотеку
            </Link>
            <a href="#how" className="btn btn--ghost btn--big">
              Как это работает
            </a>
          </div>
        </div>
        <div className="mosaic" aria-hidden="true">
          <div className="mosaic__tile" style={{ background: "var(--white)", gridColumn: "span 2" }}>Хочу прочитать</div>
          <div className="mosaic__tile" style={{ background: "var(--yellow)", gridColumn: "span 3" }}>Читаю сейчас</div>
          <div className="mosaic__tile" style={{ background: "var(--pink)", gridColumn: "span 3" }}>Прочитано</div>
          <div className="mosaic__tile" style={{ background: "var(--blue)", gridColumn: "span 2" }}>Оценки</div>
          <div className="mosaic__tile" style={{ background: "var(--lime)", gridColumn: "span 5" }}>Моя полка</div>
        </div>
      </section>

      <section className="container section" id="features">
        <h2>Возможности</h2>
        <div className="features">
          {features.map((f) => (
            <article key={f.title} className="feature" style={{ background: f.color }}>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
          <article className="feature feature--wide">
            <div>
              <h3>Настройте сайт под себя</h3>
              <p>Выберите шрифт для всего сайта, светлую или тёмную тему и фон-текстуру.</p>
            </div>
            <ul className="feature__chips" aria-label="Что можно настроить">
              <li>Шрифт</li>
              <li>Тема</li>
              <li>Фон</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="container section" id="how">
        <h2>Как это работает</h2>
        <ol className="steps">
          {steps.map((s) => (
            <li key={s.title} className="step">
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container section">
        <div className="cta">
          <h2>Начните вести свой список сегодня</h2>
          <Link to={target} className="btn btn--ink btn--big">
            Открыть библиотеку
          </Link>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer__content">
          <div className="footer__section footer__about">
            <h3 className="footer__title">О проекте</h3>
            <p className="footer__text">
              Учебный проект: веб-приложение для ведения личного дневника чтения.
            </p>
          </div>

          <div className="footer__section footer__contacts">
            <h3 className="footer__title">Контакты</h3>
            <ul className="footer__contact-list">
              <li className="footer__contact-item">
                <a href="https://github.com/Anast-Ch/Reading-tracker" target="_blank" rel="noopener noreferrer" className="footer__link">
                  <svg className="footer__icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>Github проекта</span>
                </a>
              </li>
              <li className="footer__contact-item">
                <a href="https://t.me/твой-ник" target="_blank" rel="noopener noreferrer" className="footer__link">
                  <svg className="footer__icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span>тг канал</span>
                </a>
              </li>
              <li className="footer__contact-item">
                <a href="mailto:email1@example.com" className="footer__link">
                  <svg className="footer__icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span>studentik1@gmail.com</span>
                </a>
              </li>
              <li className="footer__contact-item">
                <a href="mailto:email2@example.com" className="footer__link">
                  <svg className="footer__icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span>studentik2@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__signature">
          <span className="footer__bt">BT</span>
          <p className="footer__copyright">© 2026</p>
        </div>
      </footer>
    </main>
  );
}