# Схема базы данных 

## Таблица users

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | логин пользователя |
| name | VARCHAR(100) | NULLABLE | отображаемое имя; `NULL` при регистрации, задаётся через `PATCH /users/me` |
| password_hash | VARCHAR(255) | NOT NULL | хэш пароля (bcrypt/argon2) |
| created_at | DATETIME | NOT NULL, DEFAULT now() | |

## Таблица user_books

Личная запись о книге в дневнике чтения конкретного пользователя.
Общего каталога книг нет, каждая запись принадлежит только одному пользователю.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT | |
| user_id | INTEGER | FK → users.id, NOT NULL, ON DELETE CASCADE | владелец записи |
| title | VARCHAR(500) | NOT NULL | название книги |
| author | VARCHAR(300) | NOT NULL | автор книги |
| publish_year | INTEGER | NULLABLE | год издания книги; `CHECK (publish_year > 0)` |
| status | VARCHAR(20) | NOT NULL, CHECK IN ('want_to_read','reading','read') | статус в дневнике |
| start_date | DATE | NULLABLE | дата начала чтения |
| finish_date | DATE | NULLABLE | дата завершения чтения |
| rating | INTEGER | NULLABLE, CHECK (1 <= rating <= 5) | только для status = 'read' |
| pages_count | INTEGER | NULLABLE, CHECK (pages_count > 0) | опционально, для статистики |
| cover_path | VARCHAR(500) | NULLABLE | путь к загруженному файлу обложки |
| created_at | DATETIME | NOT NULL, DEFAULT now() | |
| updated_at | DATETIME | NOT NULL, DEFAULT now(), ON UPDATE now() | |

## Бизнес-правила (валидация на уровне приложения)
- `rating` разрешён только если `status = 'read'`. При другом статусе — должен быть NULL.
- `finish_date` не может быть раньше `start_date`.
- Если `status = 'read'` — `finish_date` обязателен.
- Если `status = 'want_to_read'` — `start_date` и `finish_date` должны быть NULL.
- `cover_path` не задаётся напрямую пользователем в теле запроса — заполняется сервером автоматически после загрузки файла через отдельный endpoint.

