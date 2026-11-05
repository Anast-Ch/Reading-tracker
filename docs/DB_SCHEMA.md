# Схема базы данных

СУБД: PostgreSQL 16 (запускается через `docker compose`).
Таблицы создаются автоматически при старте сервера.

## users

| Поле | Тип | Описание |
|------|-----|----------|
| id | integer, PK | |
| email | varchar(255), unique, not null | |
| password_hash | varchar(255), not null | bcrypt-хэш |
| name | varchar(150), null | задаётся в профиле |
| created_at | timestamptz, not null | по умолчанию текущее время |

## user_books

Одна запись — одно прочтение книги пользователем. Отдельной таблицы
`books` нет: книги не используются совместно между пользователями.

| Поле | Тип | Описание |
|------|-----|----------|
| id | integer, PK | |
| user_id | integer, FK → users.id, ON DELETE CASCADE, not null, индекс | |
| title | varchar(500), not null | |
| author | varchar(300), not null | |
| publish_year | integer, null | год издания |
| status | varchar(20), not null | `want_to_read`, `reading`, `read` |
| start_date | date, null | |
| finish_date | date, null | |
| rating | integer, null | 1–5 |
| pages_count | integer, null | |
| cover_path | varchar(500), null | путь к файлу обложки, например `/static/covers/<uuid>.jpg` |
| created_at | timestamptz, not null | |
| updated_at | timestamptz, not null | обновляется при изменении записи |

### Ограничения в БД (CHECK)

- `status IN ('want_to_read', 'reading', 'read')`
- `rating IS NULL OR rating BETWEEN 1 AND 5`
- `pages_count IS NULL OR pages_count > 0`
- `publish_year IS NULL OR publish_year > 0`

Правила, зависящие от статуса и дат (оценка и дата завершения только у
«Прочитано», даты не в будущем, завершение не раньше начала), проверяются
на уровне сервиса — см. `API.md`.

## Удаление данных

При удалении пользователя все его записи в `user_books` удаляются каскадом.
