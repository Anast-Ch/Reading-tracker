import { useState } from "react";
import "./BookSearch.css";

interface SearchResult {
  title: string;
  author: string;
  publish_year?: number;
  pages_count?: number;
  cover_url?: string;
}

interface Props {
  onSelect: (book: SearchResult) => void;
  selectedBook: SearchResult | null;
  onClear: () => void;
}

// для проверки прокрутки
const MOCK_RESULTS: SearchResult[] = [
  { title: "Война и мир", author: "Лев Толстой", publish_year: 1869, pages_count: 1300 },
  { title: "Преступление и наказание", author: "Фёдор Достоевский", publish_year: 1866, pages_count: 671 },
  { title: "Мастер и Маргарита", author: "Михаил Булгаков", publish_year: 1967, pages_count: 480 },
  { title: "1984", author: "Джордж Оруэлл", publish_year: 1949, pages_count: 328 },
  { title: "Сто лет одиночества", author: "Габриэль Гарсиа Маркес", publish_year: 1967, pages_count: 417 },
  { title: "Убить пересмешника", author: "Харпер Ли", publish_year: 1960, pages_count: 281 },
  { title: "Великий Гэтсби", author: "Ф. Скотт Фицджеральд", publish_year: 1925, pages_count: 180 },
  { title: "Над пропастью во ржи", author: "Джером Сэлинджер", publish_year: 1951, pages_count: 214 },
  { title: "Гарри Поттер и философский камень", author: "Дж. К. Роулинг", publish_year: 1997, pages_count: 309 },
  { title: "Игра в бисер", author: "Герман Гессе", publish_year: 1943, pages_count: 558 },
  { title: "Лавр", author: "Евгений Водолазкин", publish_year: 2012, pages_count: 384 },
  { title: "Зулейха открывает глаза", author: "Гузель Яхина", publish_year: 2015, pages_count: 496 },
  { title: "Маленький принц", author: "Антуан де Сент-Экзюпери", publish_year: 1943, pages_count: 96 },
  { title: "Три товарища", author: "Эрих Мария Ремарк", publish_year: 1936, pages_count: 480 },
  { title: "Шёл по дороге человек", author: "Кормак Маккарти", publish_year: 2006, pages_count: 613 },
  { title: "Норвежский лес", author: "Харуки Мураками", publish_year: 1987, pages_count: 296 },
  { title: "Имя розы", author: "Умберто Эко", publish_year: 1980, pages_count: 536 },
  { title: "Собор Парижской Богоматери", author: "Виктор Гюго", publish_year: 1831, pages_count: 934 },
];

export default function BookSearch({ onSelect, selectedBook, onClear }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    setResults([]);
    setOpen(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const filtered = MOCK_RESULTS.filter(
        (b) =>
          b.title.toLowerCase().includes(query.toLowerCase()) ||
          b.author.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      if (filtered.length === 0) setError("Ничего не найдено — заполните форму ниже");
    } catch {
      setError("Поиск недоступен — введите вручную");
    } finally {
      setSearching(false);
    }
  }

  function handleSelect(book: SearchResult) {
    onSelect(book);
    setOpen(false);
  }

  function handleClearSelected() {
    setQuery("");
    setResults([]);
    setError("");
    setOpen(false);
    onClear();
  }

  if (selectedBook) {
    return (
      <div className="search-selected">
        <div className="search-selected__card">
          <div className="search-selected__cover">
            {selectedBook.cover_url ? (
              <img src={selectedBook.cover_url} alt={selectedBook.title} />
            ) : (
              <div className="cover--empty">📚</div>
            )}
          </div>
          <div className="search-selected__info">
            <h4>{selectedBook.title}</h4>
            <p>{selectedBook.author}</p>
            {selectedBook.publish_year && <p>{selectedBook.publish_year} г.</p>}
            {selectedBook.pages_count && <p>{selectedBook.pages_count} стр.</p>}
          </div>
          <button
            type="button"
            className="search-selected__clear"
            onClick={handleClearSelected}
            aria-label="Снять выбор"
            title="Снять выбор"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-search">
      <label className="field">
        Поиск книги
        <div className="book-search__row">
          <div className="book-search__input-wrap">
            <input
              type="text"
              placeholder="Введите название или автора"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearch();
                }
              }}
            />
            {query && (
              <button
                type="button"
                className="book-search__clear-input"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setError("");
                  setOpen(false);
                }}
                aria-label="Очистить"
                title="Очистить"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            className="btn btn--blue btn--small"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
          >
            {searching ? "..." : "Найти"}
          </button>
        </div>
        {error && <span className="field__error">{error}</span>}
      </label>

      {open && results.length > 0 && (
        <ul className="book-search__results">
          {results.map((book, idx) => (
            <li key={idx}>
              <button type="button" className="book-search__result-item" onClick={() => handleSelect(book)}>
                <div className="book-search__result-cover">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} />
                  ) : (
                    <div className="cover--empty">📚</div>
                  )}
                </div>
                <div className="book-search__result-info">
                  <strong>{book.title}</strong>
                  <span>{book.author}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}