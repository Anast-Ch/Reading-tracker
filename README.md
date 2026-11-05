# Reading Tracker

Веб-приложение для ведения личного дневника чтения.

## Структура

- `backend/` — серверная часть (Python, FastAPI, PostgreSQL)
- `frontend/` — клиентская часть
- `docs/` — документация (`API.md`, `DB_SCHEMA.md`)

## Запуск backend

Нужны Python 3.10+ и Docker.

1. Запустить базу данных (из корня репозитория):

        docker compose up -d

2. Установить зависимости и настроить окружение:

        cd backend
        python -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        cp .env.example .env

3. Запустить сервер:

        uvicorn app.main:app --reload

Swagger: http://localhost:8000/docs

Таблицы создаются автоматически при старте сервера.

## Остановка и сброс базы

- Остановить базу: `docker compose stop`
- Удалить базу вместе с данными: `docker compose down -v`
