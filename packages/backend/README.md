# epds (backend)

Бэкенд‑сервис для UMe‑chan:  
**синхронизатор базы** с внешним API pissykaka и **REST API** для фронтенда.

> Этот пакет — часть монорепы `umechan-opti`.  
> Общий обзор и инструкции см. в корневом [`README.md`](../../README.md).

---

## Возможности

- Периодическая синхронизация БД с внешним API:
  - полный начальный синк;
  - периодический full sync по `FULL_SYNC_INTERVAL_SECONDS`;
  - on-demand partial sync треда (`updatePartial` / `force_sync`).
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
- **FULL_SYNC_INTERVAL_SECONDS** — интервал между периодическими full sync (сек).
- **FETCH_ENTITIES_FROM_API_BASE_LIMIT** — базовый лимит выборки сущностей из API.
- **FETCH_ENTITIES_MAX_PARALLEL_JOBS** — максимальное количество параллельных запросов.
- **DATABASE_URL** — строка подключения SQLite (по умолчанию `file:./dev.db`).
- **DEFAULT_LIMIT**, **DEFAULT_THREAD_SIZE** — дефолтные параметры выборок.
- **API_DEFAULT_LISTEN_PORT**, **API_DEFAULT_LISTEN_HOST** — порт/хост HTTP API.
- **MODERATION_SECRET_PASS** — секрет для модераторского функционала.
- **METRICS_PASSWORD** — пароль для эндпоинта `/metrics`.
- **P2P_NODE_ID**, **P2P_SYNC_TOKEN** — включают p2p server/client (обязательны вместе).
- **P2P_UPSTREAM_URL** — если задан, узел = replica (без pissykaka sync); иначе root.
- **P2P_CONTROL_LISTEN_***, **P2P_ADVERTISE_WS_URL**, **P2P_ADVERTISE_PUSH_URL** — control plane (WS+push на primary).
- **P2P_CALLBACK_BASE_URL** — URL этого узла для raw GET при push-up.

---

## P2P репликация

Дерево узлов (один upstream на child). Root тянет pissykaka и раздаёт state; replica подключается к upstream.

**Workers (REST):** `GET /p2p/meta`, `/p2p/snapshot`, `/p2p/changes`, `/p2p/raw/...`, `/p2p/files/...`  
**Primary:** `WS /p2p/ws`, `POST /p2p/push` (порт `P2P_CONTROL_LISTEN_PORT`)

Auth: `Authorization: Bearer $P2P_SYNC_TOKEN`.  
Реплицируются Board/Post/Media/Chat*; не Settings, не SyncChangeLog, не миграции.  
Конфликты: LWW `(updatedAt, originNodeId)`. Live-события — указатели; данные — raw MessagePack.

Пример replica `.env`:

```bash
P2P_NODE_ID=leaf-1
P2P_SYNC_TOKEN=shared-secret
P2P_UPSTREAM_URL=http://root:3000
P2P_CALLBACK_BASE_URL=http://leaf:3000
P2P_CONTROL_LISTEN_PORT=3002
```

Код: `src/p2p/` (journal, routes, controlServer, client, apply).

---

## Скрипты (`package.json`)

- **`pnpm run build`** — компиляция TypeScript в `dist/`.
- **`pnpm run start`** — сборка и запуск сервера с чтением `.env`.
- **`pnpm run start:cluster`** — N API workers + sync в primary.
- **`pnpm run start:no-full-sync`** — запуск без full sync (только API).
- **`pnpm run test`** — типизация + `node --test` по `dist`.
- **`pnpm run migrate`** — запуск миграций (через `db/cli.ts`).
- **`pnpm run migration:generate`** — генерация миграции на основе текущей схемы.
- **`pnpm run migration:create`** — создание пустой миграции.

---

## Архитектура (вкратце)

- **`sync/`** — синхронизация:
  - `createSyncService` — оркестратор (SyncSource, getFullThreads, processBoards/processPosts).
- **`sources/`** — адаптер внешнего API: `createRestSource`, контракт `SyncSource`.
- **`db/`** — TypeORM: entities, repositories, migrations, `cli.ts`.
- **`api/`** — Fastify: `routes/boards.ts`, `routes/util.ts`.
- **`p2p/`** — peer sync: journal, REST/WS, replica client.
- **`types/`** — типы внешнего API (responseBoardsList, responseThreadsList и т.д.).

---

## Лицензия

См. поле `license` в `package.json` (WTFPL).
