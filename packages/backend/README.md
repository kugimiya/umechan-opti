# epds (backend)

Бэкенд‑сервис для UMe‑chan:  
**синхронизатор базы** с внешним API pissykaka и **REST API** для фронтенда.

> Этот пакет — часть монорепы `umechan-opti`.  
> Общий обзор и инструкции см. в корневом [`README.md`](../../README.md).

---

## Возможности

- Периодическая синхронизация БД с внешним API:
  - полный начальный синк;
  - последующие тики по событиям (`/v2/event`).
- REST API для фронтенда:
  - список досок, тредов, фида;
  - данные по конкретному посту/треду;
  - утилитарные ручки (`/api/v2/util/*`, `/metrics`).
- Хранение данных в **SQLite** через **TypeORM** (драйвер `better-sqlite3`).

---

## Требования

- Node.js ≥ 20
- pnpm ≥ 8
- Доступ к API pissykaka (по умолчанию `https://scheoble.xyz/api`)

База данных — **SQLite** (файл по умолчанию `./data/dev.db` внутри пакета).

---

## Установка и запуск (через монорепу)

Использовать предпочтительно **из корня** репозитория:

```bash
# из корня monorepo
pnpm install          # установка зависимостей для всех пакетов

pnpm run build        # сборка shared + backend + frontend
pnpm run dev          # фронт + бэк одновременно
```

Для запуска только бэкенда:

```bash
# из корня
pnpm --filter epds run build
pnpm --filter epds run start
```

или из директории самого пакета:

```bash
cd packages/backend
pnpm run build
pnpm run start
```

---

## Конфигурация (`.env`)

Шаблон лежит в `packages/backend/.env.example`:

```bash
cd packages/backend
cp .env.example .env
```

Основные переменные:

- **PISSYKAKA_HOSTNAME**, **PISSYKAKA_API** — адрес внешнего API.
- **DELAY_AFTER_UPDATE_TICK** — задержка между тиками синка (мс).
- **FETCH_ENTITIES_FROM_API_BASE_LIMIT** — базовый лимит выборки сущностей из API.
- **FETCH_ENTITIES_MAX_PARALLEL_JOBS** — максимальное количество параллельных запросов.
- **DATABASE_URL** — строка подключения SQLite (по умолчанию `file:./dev.db`).
- **DEFAULT_LIMIT**, **DEFAULT_THREAD_SIZE** — дефолтные параметры выборок.
- **API_DEFAULT_LISTEN_PORT**, **API_DEFAULT_LISTEN_HOST** — порт/хост HTTP API.
- **MODERATION_SECRET_PASS** — секрет для модераторского функционала.
- **METRICS_PASSWORD** — пароль для эндпоинта `/metrics`.

---

## Скрипты (`package.json`)

- **`pnpm run build`** — компиляция TypeScript в `dist/`.
- **`pnpm run start`** — сборка и запуск сервера с чтением `.env`.
- **`pnpm run start:no-tick-sync`** — запуск без тик‑синхронизации (только API).
- **`pnpm run start:no-full-sync`** — запуск без initial full sync.
- **`pnpm run test`** — типизация + `node --test` по `dist`.
- **`pnpm run migrate`** — запуск миграций (через `db/cli.ts`).
- **`pnpm run migration:generate`** — генерация миграции на основе текущей схемы.
- **`pnpm run migration:create`** — создание пустой миграции.

---

## Архитектура (вкратце)

- **`sync/`** — синхронизация:
  - `createUpdateTick` — оркестратор (SyncSource, getFullThreads, processBoards/processPosts, processEvents).
- **`sources/`** — адаптер внешнего API: `createRestSource`, контракт `SyncSource`.
- **`db/`** — TypeORM: entities, repositories, migrations, `cli.ts`.
- **`api/`** — Fastify: `routes/boards.ts`, `routes/util.ts`.
- **`types/`** — типы внешнего API (responseBoardsList, responseThreadsList и т.д.).

---

## Лицензия

См. поле `license` в `package.json` (WTFPL).
