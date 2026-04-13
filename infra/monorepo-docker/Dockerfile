FROM node:22-alpine AS base

WORKDIR /app

RUN corepack enable

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json packages/backend/package.json
COPY packages/frontend/package.json packages/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS build

ARG NEXT_PUBLIC_PISSYKAKA_API
ARG NEXT_PUBLIC_EPDS_API
ARG NEXT_PUBLIC_DEFAULT_LIMIT
ARG NEXT_PUBLIC_FRONT_BASEURL
ARG NEXT_PUBLIC_PAGINATOR_MAX_ITEMS
ARG NEXT_PUBLIC_CHAN_NAME
ARG NEXT_PUBLIC_FEATURE_FLAG_MODERKA
ARG METRICS_PASSWORD

ENV NEXT_PUBLIC_PISSYKAKA_API=${NEXT_PUBLIC_PISSYKAKA_API}
ENV NEXT_PUBLIC_EPDS_API=${NEXT_PUBLIC_EPDS_API}
ENV NEXT_PUBLIC_DEFAULT_LIMIT=${NEXT_PUBLIC_DEFAULT_LIMIT}
ENV NEXT_PUBLIC_FRONT_BASEURL=${NEXT_PUBLIC_FRONT_BASEURL}
ENV NEXT_PUBLIC_PAGINATOR_MAX_ITEMS=${NEXT_PUBLIC_PAGINATOR_MAX_ITEMS}
ENV NEXT_PUBLIC_CHAN_NAME=${NEXT_PUBLIC_CHAN_NAME}
ENV NEXT_PUBLIC_FEATURE_FLAG_MODERKA=${NEXT_PUBLIC_FEATURE_FLAG_MODERKA}
ENV METRICS_PASSWORD=${METRICS_PASSWORD}

COPY . .

RUN pnpm --filter @umechan/shared run build \
  && pnpm --filter epds run build \
  && pnpm --filter umechan-opti run build

FROM node:22-alpine AS backend-runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app /app

WORKDIR /app/packages/backend

EXPOSE 3000

CMD ["sh", "-c", "node dist/db/cli.js migrate && npm run start:no-tick-sync"]

FROM node:22-alpine AS frontend-runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app /app

WORKDIR /app/packages/frontend

EXPOSE 3040

CMD ["sh", "-c", "npm run start"]
