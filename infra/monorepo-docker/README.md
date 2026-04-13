# Monorepo Docker (prod-like)

This directory contains a prod-like Docker setup for the monorepo services:
- `backend` (`epds`)
- `frontend` (`umechan-opti`)
- optional `kafka-ui` profile

## 1) Quick start

```bash
cd infra/monorepo-docker
cp .env.example .env
make config
make up-clean
```

`make up-clean` is the default recommended path because it forces a clean image rebuild (`--no-cache --pull`) and then recreates containers.

## 2) Environment model (hybrid)

- Base compose env lives in `infra/monorepo-docker/.env`.
- Optional service-level env files can be attached via:
  - `BACKEND_ENV_FILE` (default `../../packages/backend/.env`)
  - `FRONTEND_ENV_FILE` (default `../../packages/frontend/.env.local`)
- You can override any value from shell/CI, for example:

```bash
NEXT_PUBLIC_EPDS_API=https://api.example.com make up-clean
```

## 3) Why clean rebuild is important for frontend

`NEXT_PUBLIC_*` values are consumed during `next build`.  
If these variables change, you must rebuild images. `make up-clean` guarantees this behavior.

## 4) Commands

- `make up-clean` - clean rebuild + recreate containers (recommended)
- `make up` - normal build cache-friendly startup
- `make down` - stop stack
- `make logs` - follow logs
- `make ps` - show running services

## 5) Optional Kafka UI profile

Start with profile:

```bash
docker compose --env-file .env -f docker-compose.yml --profile kafka-ui up --build
```

Configure Kafka access variables in `.env` (`KAFKA_*` keys).
