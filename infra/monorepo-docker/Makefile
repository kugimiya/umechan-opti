SHELL := /bin/sh
COMPOSE := docker compose --env-file .env -f docker-compose.yml

.PHONY: setup config up up-clean down logs ps

setup:
	cp -n .env.example .env || true

config:
	$(COMPOSE) config

up:
	$(COMPOSE) up --build

up-clean:
	$(COMPOSE) build --no-cache --pull
	$(COMPOSE) up --force-recreate

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f --tail=200

ps:
	$(COMPOSE) ps
