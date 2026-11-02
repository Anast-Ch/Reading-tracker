import React, { useState } from 'react';
import './LibraryPage.css';

type BookStatus = 'want_to_read' | 'reading' | 'read';

interface Book {
  id: number;
  title: string;
  author: string;
  status: BookStatus;
  rating?: number;
  coverColor?: string;
  finishedDate?: string;
}

// Временные моковые данные 
const mockBooks: Book[] = [
  { id: 1, title: 'Мастер и Маргаритаdfgfdfghdfghddfgfdgdfgfdgfdgfdgfdgfdgfdgfdgfdgfdg', author: 'М. Булгаков', status: 'read', rating: 5, finishedDate: '12 окт 2026' },
  { id: 2, title: '1984', author: 'Дж. Оруэлл', status: 'read', rating: 4, finishedDate: '3 окт 2026' },
  { id: 3, title: 'Сто лет одиночества', author: 'Г. Гарсиа Маркес', status: 'read', rating: 5, finishedDate: '21 сен 2026' },
  { id: 4, title: 'Преступление и наказание', author: 'Ф. Достоевский', status: 'read', rating: 4, finishedDate: '30 авг 2026' },
  { id: 5, title: 'Дюна', author: 'Ф. Герберт', status: 'read', rating: 3, finishedDate: '14 авг 2026' },
  { id: 6, title: 'Маленький принц', author: 'А. де Сент-Экзюпери', status: 'reading', rating: 0 },
  { id: 7, title: 'Над пропастью во ржи', author: 'Дж. Сэлинджер', status: 'want_to_read' },
  { id: 8, title: 'Одиссея', author: 'Гомер', status: 'want_to_read' },
];

const LibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BookStatus>('read');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // Фильтрация книг по статусу
  const filteredBooks = mockBooks.filter(book => book.status === activeTab);

  // Подсчет книг для табов
  const booksCount = {
    want_to_read: mockBooks.filter(b => b.status === 'want_to_read').length,
    reading: mockBooks.filter(b => b.status === 'reading').length,
    read: mockBooks.filter(b => b.status === 'read').length,
  };

  return (
    <div className="library-page">
      <div className="library-header">
        <h1>Моя библиотека</h1>
        
        <div className="library-controls">
          <button className="sort-btn">По дате окончания</button>
          <button className="add-book-btn">+ Добавить книгу</button>
        </div>
      </div>

      <div className="status-tabs">
        <button 
          className={`status-tab ${activeTab === 'want_to_read' ? 'active' : ''}`}
          onClick={() => setActiveTab('want_to_read')}
        >
          Хочу прочитать ({booksCount.want_to_read})
        </button>
        <button 
          className={`status-tab ${activeTab === 'reading' ? 'active' : ''}`}
          onClick={() => setActiveTab('reading')}
        >
          Читаю ({booksCount.reading})
        </button>
        <button 
          className={`status-tab ${activeTab === 'read' ? 'active' : ''}`}
          onClick={() => setActiveTab('read')}
        >
          Прочитано ({booksCount.read})
        </button>
      </div>

      {/* Фильтр по годам */}
      {activeTab === 'read' && (
        <div className="year-filters">
          {['2026', '2025', '2024', 'Все годы'].map(year => (
            <button
              key={year}
              className={`year-btn ${selectedYear === year ? 'active' : ''}`}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      <div className='books-grid'>
        {filteredBooks.map(book => (
          <div key={book.id} className="book-card">
            <div className="book-cover" style={{ backgroundColor: getCoverColor(book.id) }}>
            </div>
            <div className="book-info">
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author">{book.author}</p>
              {book.rating && (
                <div className="book-rating">
                  {'★'.repeat(book.rating)}
                  {'☆'.repeat(5 - book.rating)}
                </div>
              )}
              {book.finishedDate && (
                <span className="book-date">{book.finishedDate}</span>
              )}
              <div className="book-actions">
                <button className="edit-btn">Изменить</button>
                <button className="more-btn">⋯</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// функция для цветов обложек
const getCoverColor = (id: number): string => {
  const colors = ['#CAEDB8', '#56694F', '#963F2E', '#FC8A2D', '#3D1534', '#9E9820', '#F0C283', '#5D6973', '#CF6E6C', '#DCA7A1',
    '#F39BB3', '#A7F3F3', '#8AA68F', '#D4D973', '#BF9177', '#B26565',];
  return colors[id % colors.length];
};

export default LibraryPage;