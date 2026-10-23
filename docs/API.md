# API — Reading Tracker

Базовый URL (локально): `http://localhost:8000`

## Аутентификация

### POST /auth/register

Регистрация нового пользователя.

**Запрос:**

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Ответ 201:**

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": null
}
```

**Ошибки:**

- `400` — email уже занят / невалидный формат email / пароль слишком короткий

### POST /auth/login

Вход. Возвращает JWT-токен.

**Запрос:**

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Ответ 200:**

```json
{
  "access_token": "jwt...",
  "token_type": "bearer"
}
```

**Ошибки:**

- `401` — неверный email или пароль

---

> **Все запросы ниже требуют заголовок:** `Authorization: Bearer <access_token>`

## Книги

### GET /books

Список книг текущего пользователя.

**Query-параметры:**

- `status` (опционально): `want_to_read` | `reading` | `read`
- `year` (опционально, int): фильтр по году завершения чтения (`finish_date`). Допустим только если `status=read`. При передаче `year` без `status=read` — ошибка `400`.
- `sort_by` (опционально): `created_at` | `start_date` | `finish_date` | `title` | `author`. По умолчанию `created_at`.
- `order` (опционально): `asc` | `desc`. По умолчанию `desc`.

**Ответ 200:**

```json
[
  {
    "id": 1,
    "title": "Война и мир",
    "author": "Лев Толстой",
    "publish_year": 1869,
    "status": "reading",
    "start_date": "2025-10-01",
    "finish_date": null,
    "rating": null,
    "pages_count": 1300,
    "cover_path": null,
    "created_at": "2025-10-01T12:00:00"
  }
]
```

### GET /books/counts

Количество книг пользователя в каждом статусе (для бейджей на вкладках).

**Ответ 200:**

```json
{
  "want_to_read": 12,
  "reading": 2,
  "read": 47
}
```

### GET /books/years

Список лет, по которым есть хотя бы одна прочитанная книга (на основе `finish_date`). Используется только для фильтра на вкладке «Прочитано».

**Ответ 200:**

```json
[2026, 2025, 2024]
```

### POST /books

Создать запись о книге (форма ручного ввода).

**Запрос:**

```json
{
  "title": "string (обязательно)",
  "author": "string (обязательно)",
  "publish_year": "int (опционально)",
  "status": "want_to_read | reading | read",
  "start_date": "YYYY-MM-DD (опционально)",
  "finish_date": "YYYY-MM-DD (обязательно, если status='read')",
  "rating": "1-5 (опционально, только если status='read')",
  "pages_count": "int > 0 (опционально)"
}
```

**Ответ 201:** созданный объект книги (формат как в `GET /books`).

**Ошибки:**

- `400` — не заполнены `title`/`author`, `rating` указан при `status != 'read'`, `finish_date` раньше `start_date`, `finish_date` отсутствует при `status='read'`.

### GET /books/{id}

Получить одну запись. `404`, если не найдена или принадлежит другому пользователю.

### PATCH /books/{id}

Частичное обновление (статус / даты / оценка / страницы / год издания).

**Запрос:** любое подмножество полей из `POST /books`.

**Ошибки:** те же бизнес-правила, что и при создании.

### DELETE /books/{id}

Удалить запись. **Ответ 204.**

## Обложка

### POST /books/{id}/cover

Загрузить/заменить обложку. `multipart/form-data`, поле `file`.

**Ограничения:**

- форматы: jpg, jpeg, png, webp
- максимальный размер: 2 МБ

**Ответ 200:**

```json
{
  "cover_path": "/static/covers/3f9a1b2c.jpg"
}
```

**Ошибки:**

- `400` — неверный формат файла / файл слишком большой / файл повреждён

### DELETE /books/{id}/cover

Удалить обложку. **Ответ 204.**

## Статистика

### GET /stats

Возвращает статистику за один конкретный период (месяц / сезон / год). Используется для навигации кнопками «‹ ›» на экране статистики.

**Query-параметры:**

- `period` (обязательно): `month` | `season` | `year`
- `year` (обязательно, int): календарный год периода
- `month` (обязательно, только если `period=month`): int, 1–12
- `season` (обязательно, только если `period=season`): `winter` | `spring` | `summer` | `autumn`

**Ответ 200:**

```json
{
  "period": "year",
  "year": 2026,
  "month": null,
  "season": null,
  "count_read": 47,
  "average_rating": 4.2
}
```

> **Примечание:** если за период не прочитано ни одной книги, `average_rating` возвращается как `null`, `count_read` — `0`.

## Профиль

### GET /users/me

Получить данные текущего пользователя.

**Ответ 200:**

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Анна"
}
```

### PATCH /users/me

Обновить имя и/или email.

**Запрос:**

```json
{
  "name": "string (опционально)",
  "email": "string (опционально)"
}
```

**Ошибки:**

- `400` — email уже занят другим пользователем / невалидный формат

### PATCH /users/me/password

Смена пароля.

**Запрос:**

```json
{
  "current_password": "string",
  "new_password": "string"
}
```

**Ошибки:**

- `400` — текущий пароль неверен / новый пароль не соответствует требованиям

### DELETE /users/me

Удалить аккаунт пользователя вместе со всеми его книгами (каскадное удаление). **Ответ 204.**
