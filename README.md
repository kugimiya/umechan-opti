# umechan-opti

Монорепозиторий для UMe-Chan:  
**Next.js‑фронтенд**, **Fastify + TypeORM + SQLite бэкенд** и **общий TypeScript‑пакет с типами**.

Репо ориентировано на:
- аккуратный **BFF** для внешнего API (pissykaka);
- удобный **Next.js‑клиент** с типобезопасным доступом к данным;
- переиспользуемые **типы и enum’ы** между фронтом и бэком.

---

## Структура монорепы

```text
umechan-opti/
  package.json           # корневой package + скрипты monorepo
  pnpm-workspace.yaml    # workspace-конфигурация
  pnpm-lock.yaml         # единый lockfile для всех пакетов
  packages/
    backend/             # пакет epds — бэкенд (Fastify + TypeORM + SQLite)
    frontend/            # пакет umechan-opti — Next.js фронтенд
    shared/              # пакет @umechan/shared — общие типы и enum’ы
  update-deps.sh         # утилита для обновления зависимостей во всех пакетах
```

### Пакеты

| Пакет              | Имя npm-пакета     | Путь              | Назначение                                      |
|--------------------|--------------------|-------------------|-------------------------------------------------|
| Backend (API + sync)| `epds`            | `packages/backend`| BFF + синхронизатор базы с внешним API         |
| Frontend           | `umechan-opti`     | `packages/frontend`| Next.js‑клиент UMe‑chan                        |
| Shared types       | `@umechan/shared`  | `packages/shared` | Общие TS‑типы, enum’ы и утилитарные типы       |

---

## Быстрый старт

### Требования

- **Node.js** ≥ 20
- **pnpm** ≥ 8 (`npm install -g pnpm`)
- Доступ к внешнему API pissykaka (по умолчанию `scheoble.xyz`)

### Установка зависимостей

Из корня репозитория:

```bash
pnpm install
```

### Основные скрипты (корень монорепы)

```jsonc
{
  "scripts": {
    "dev": "pnpm --filter umechan-opti dev & pnpm --filter epds start",
    "build": "pnpm -r run build",
    "lint": "pnpm --filter umechan-opti run lint",
    "test": "pnpm --filter epds run test"
  }
}
```

- **`pnpm run dev`** — запустить **фронт** (`umechan-opti`) и **бэк** (`epds`) одновременно.
- **`pnpm run build`** — собрать **все** пакеты (`shared`, `backend`, `frontend`) с учётом зависимостей.
- **`pnpm run lint`** — запустить линтер фронтенда.
- **`pnpm run test`** — запустить тесты бэкенда (сейчас: `tsc && node --test dist`).

> Рекомендуется **не использовать `npm install`** внутри подпакетов. Источник правды — один `pnpm-lock.yaml` в корне.

---

## Конфигурация окружения

### Backend (`packages/backend/.env`)

См. `packages/backend/.env.example`:

```bash
cp packages/backend/.env.example packages/backend/.env
```

Ключевые переменные:

- **PISSYKAKA_HOSTNAME**, **PISSYKAKA_API** — адреса внешнего API.
- **DELAY_AFTER_UPDATE_TICK** — задержка между тиками синка (мс).
- **FETCH_ENTITIES_FROM_API_BASE_LIMIT**, **FETCH_ENTITIES_MAX_PARALLEL_JOBS** — настройки объёма и параллельности выборки.
- **DATABASE_URL** — путь к SQLite БД (по умолчанию `file:./dev.db` в `packages/backend/data`).
- **API_DEFAULT_LISTEN_PORT**, **API_DEFAULT_LISTEN_HOST** — порт/хост HTTP API.
- **MODERATION_SECRET_PASS** — секрет для модерации.
- **METRICS_PASSWORD** — пароль для `/metrics`.

### Frontend (`packages/frontend/.env.local`)

См. `packages/frontend/.env.example`:

```bash
cp packages/frontend/.env.example packages/frontend/.env.local
```

Ключевые переменные:

- **NEXT_PUBLIC_PISSYKAKA_API** — URL внешнего API pissykaka (например, `https://scheoble.xyz/api`).
- **NEXT_PUBLIC_EPDS_API** — URL бэкенда `epds` (например, `http://localhost:3001/api` или через прокси).
- **NEXT_PUBLIC_DEFAULT_LIMIT** — дефолтный лимит постов/тредов.
- **NEXT_PUBLIC_FRONT_BASEURL** — базовый URL фронтенда (используется пагинатором).
- **NEXT_PUBLIC_PAGINATOR_MAX_ITEMS** — максимальное число элементов пагинации.
- **NEXT_PUBLIC_CHAN_NAME** — отображаемое имя инстанса (title сайта).
- **NEXT_PUBLIC_FEATURE_FLAG_MODERKA** — фича‑флаг для модераторских страниц.
- **METRICS_PASSWORD** — пароль для доступа к метрикам (если фронт их запрашивает).

---

## Backend (`packages/backend`, пакет `epds`)

Бэкенд реализует:

- **синхронизацию базы** с внешним API pissykaka (полный синк + event‑тики);
- **REST API** для фронтенда (доски, треды, фид, посты, утилиты);
- **хранилище** на **SQLite + TypeORM**.

### Основные технологии

- Node.js, TypeScript
- Fastify (+ `@fastify/cors`)
- TypeORM + SQLite
- Axios (REST‑клиент к pissykaka)
- Собственный слой логирования и измерения времени (`logger`, `measureTime`)

### Структура `src/`

```text
packages/backend/src/
  index.ts               # entrypoint: парсинг CLI-флагов, запуск sync + API
  api/
    server.ts            # createApiServer(...)
    index.ts             # реэкспорт createApiServer
    routes/
      boards.ts          # REST API для досок/тредов/фида
      util.ts            # /api/v2/util/* (force_sync, la, /metrics)
  sync/
    createUpdateTick.ts  # createUpdateTick(baseUrl) — оркестратор синка
    getFullThreads.ts    # полный список тредов из внешнего API
    index.ts
    processors/
      processBoards.ts   # sync boards -> DB
      processPosts.ts    # sync posts/media -> DB
      processEvents.ts   # обработка событий (event API)
  sources/
    rest.ts              # createRestSource({ baseUrl }) — REST‑клиент pissykaka
    types.ts             # интерфейс SyncSource
    index.ts
  db/
    dataSource.ts        # TypeORM DataSource (sqlite + путь к dev.db)
    runMigrations.ts     # helper для прогонки миграций
    cli.ts               # CLI: migrate / migrate:revert / migrate:show
    connection.ts        # createDbConnection(): инициализация и репозитории
    entities/            # Board, Post, Media, Settings
    migrations/
      1700000000000-initialMigration.ts
    repositories/
      boards.ts
      posts.ts
      media.ts
      settings.ts
      apis.ts            # read‑модель для API (boards/threads/feed)
    transformers.ts      # bigintTransformer
  types/                 # типы внешнего API (Response*, ApiTemplate)
  utils/
    config.ts            # конфиг из env: apiDefaultListenPort и т.п.
    logger.ts            # единый логгер
    measureTime.ts
    parallelExecutor.ts
    sleep.ts
```

Подробнее — см. `packages/backend/README.md`.

---

## Frontend (`packages/frontend`, пакет `umechan-opti`)

Next.js‑приложение (App Router) поверх бэкенда `epds`:

- лента, треды, доски;
- предпросмотр медиа (изображения, YouTube, видео);
- быстрые ответы, markdown‑рендер сообщений;
- простая модераторская часть (под фича‑флагом).

Основные технологии:

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript
- Axios для обращения к `epds`
- Контексты и провайдеры для локального состояния (модалка постинга, карта медиа, карта ответов)

Подробнее — см. `packages/frontend/README.md`.

---

## Shared types (`packages/shared`, пакет `@umechan/shared`)

Общий TypeScript‑пакет:

- Типы для **EPDS API**, используемые фронтом и бэком (`Epds*`).
- Enum `MediaType` для типов медиа.
- Утилитарные типы, используемые фронтендом:
  - `LinkItem`
  - `WithPagination`
  - `UnmodFlag` (строгий тип для `"true" | "false"`).

Структура:

```text
packages/shared/
  package.json
  tsconfig.json
  src/
    index.ts     # barrel-экспорт
    epds.ts      # доменные типы EPDS API
    media.ts     # MediaType
    utils.ts     # LinkItem, WithPagination, UnmodFlag и др.
```

Сборка:

```bash
pnpm --filter @umechan/shared run build
# или
pnpm -r run build
```

Подробнее — см. `packages/shared/README.md`.

---

## Обновление зависимостей

Для всех пакетов монорепы есть утилита:

```bash
./update-deps.sh
```

Скрипт:

1. Проверяет наличие `npm-check-updates` (`ncu`), при необходимости устанавливает глобально.
2. Прогоняет `ncu -u` в `packages/shared`, `packages/backend`, `packages/frontend`.
3. Вызывает один общий `pnpm install` из корня.

---

## Лицензия

Пакет `epds` (backend) помечен лицензией **WTFPL** в своём `package.json`.  
Остальная часть монорепы может быть переоформлена под единую лицензию по мере необходимости.

