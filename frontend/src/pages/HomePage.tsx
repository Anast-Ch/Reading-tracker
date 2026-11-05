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

      <footer className="footer" id="contacts">
        <div className="container footer__inner">
          <div>
            <b></b>
            <p className="mut">Учебный проект. Автор: [ИМЯ АВТОРА]</p>
          </div>
          <div>
            <b>Контакты</b>
            <p className="mut">
              Email: [EMAIL]
              <br />
              GitHub: [ССЫЛКА]
              <br />
              Telegram: [ССЫЛКА]
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}