# umechan-opti (frontend)

Next.js‑клиент для UMe‑chan, работающий поверх бэкенда `epds`.

> Этот пакет — часть монорепы `umechan-opti`.  
> Общий обзор и инструкции см. в корневом [`README.md`](../../README.md).

---

## Стек

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript
- Axios (обращение к бэкенду `epds`)
- Набор утилит и контекстов для:
  - карты медиа на странице;
  - карты ответов на посты;
  - модального окна создания постов/тредов.

---

## Структура

```text
packages/frontend/
  src/
    app/                 # Next.js App Router
      page.tsx           # главная
      feed/              # /feed
      board/[board_tag]/ # доски и треды
      moderka/           # модераторские страницы (под фича-флагом)
    api/                 # клиенты к epds/pissykaka
    components/          # layout + common UI + провайдеры
    utils/               # форматтеры, контексты, энрихеры, пр.
    types/               # локальные типы (форматирование дат и т.п.)
```

---

## Конфигурация (`.env`)

Шаблон лежит в `packages/frontend/.env.example`:

```bash
cd packages/frontend
cp .env.example .env.local
```

Ключевые переменные:

- `NEXT_PUBLIC_PISSYKAKA_API` — URL внешнего API pissykaka.
- `NEXT_PUBLIC_EPDS_API` — URL бэкенда `epds` (например, `http://localhost:3001/api`).
- `NEXT_PUBLIC_DEFAULT_LIMIT` — дефолтный лимит элементов (тредов / постов).
- `NEXT_PUBLIC_FRONT_BASEURL` — базовый URL фронтенда (используется пагинатором).
- `NEXT_PUBLIC_PAGINATOR_MAX_ITEMS` — максимальное число элементов пагинации.
- `NEXT_PUBLIC_CHAN_NAME` — имя борды (попадает в `<title>` и навигацию).
- `NEXT_PUBLIC_FEATURE_FLAG_MODERKA` — включает/выключает раздел модерации.

---

## Скрипты (`package.json`)

```jsonc
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p 3040",
    "lint": "next lint"
  }
}
```

Из корня репозитория:

```bash
pnpm --filter umechan-opti dev     # dev-режим
pnpm --filter umechan-opti build   # production-сборка
pnpm --filter umechan-opti start   # запуск собранного приложения
pnpm --filter umechan-opti lint    # линтинг
```

Или из директории пакета:

```bash
cd packages/frontend
pnpm run dev
pnpm run build
pnpm run start
pnpm run lint
```

---

## Разработка

- Основные экраны реализованы через App Router (`src/app/*`).
- API‑клиент для бэкенда `epds` расположен в `src/api/epds.ts` и использует типы из `@umechan/shared`.
- Общие доменные типы (EPDS‑ответы, enum медиа и утилитарные типы) лежат в пакете `@umechan/shared` и импортируются напрямую:

```ts
import { EpdsPost } from "@umechan/shared";
```
