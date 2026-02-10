# @umechan/shared

Общий TypeScript‑пакет с типами и утилитарными типами, используемыми как во **фронтенде**, так и в **бэкенде**.

> Этот пакет — часть монорепы `umechan-opti`.  
> Общий обзор и инструкции см. в корневом [`README.md`](../../README.md).

---

## Назначение

- Описать **доменные типы EPDS API**, чтобы фронт и бэк разделяли один и тот же контракт.
- Дать единый источник правды для:
  - enum’ов (например, `MediaType`);
  - общих утилитарных типов (`LinkItem`, `WithPagination`, `UnmodFlag` и т.п.).

---

## Структура

```text
packages/shared/
  package.json
  tsconfig.json
  src/
    index.ts     # barrel-экспорт
    epds.ts      # типы для EPDS API
    media.ts     # enum MediaType
    utils.ts     # LinkItem, WithPagination, UnmodFlag и др.
```

### Основные сущности

- **`src/epds.ts`** — типы ответов EPDS API:
  - `EpdsResponseBoard`, `EpdsResponseBoards`
  - `EpdsResponseBoardThreads`
  - `EpdsResponseThread`
  - `EpdsResponseFeed`
  - `EpdsResponsePostById`
  - `EpdsBoard`, `EpdsPost`, `EpdsPostMedia`, `EpdsPostMediaType`
- **`src/media.ts`**:
  - `MediaType` — enum типа медиа (`Image`, `YouTube`, `Video`)
- **`src/utils.ts`** — вспомогательные типы:
  - `LinkItem` — элемент навигации/меню;
  - `WithPagination` — пропсы страниц с `searchParams` (`offset`, `limit`, `unmod`);
  - `UnmodFlag` — строгий тип для `"true" | "false"`.

---

## Сборка

В `package.json`:

```jsonc
{
  "name": "@umechan/shared",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json"
  }
}
```

Сборка пакета:

```bash
# из корня монорепы
pnpm --filter @umechan/shared run build

# или из директории пакета
cd packages/shared
pnpm run build
```

---

## Использование

### Во фронтенде

```ts
// packages/frontend/src/api/epds.ts
import {
  EpdsResponseBoard,
  EpdsResponseBoards,
  EpdsResponseFeed,
  EpdsResponsePostById,
  EpdsResponseThread,
} from "@umechan/shared";
```

```ts
// пример компонента
import { EpdsPost } from "@umechan/shared";

type Props = { post: EpdsPost };
```

### В бэкенде

```ts
// packages/backend/src/sync/processors/processPosts.ts
import { MediaType } from "@umechan/shared";
```

Таким образом, доменные типы и enum’ы определяются в одном месте и переиспользуются по всему проекту.
