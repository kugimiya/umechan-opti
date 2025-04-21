# epds - e9l pissykaka database syncer

This is an experimental project created to practice a BFF with custom features for a [umechan api](https://github.com/U-Me-Chan).

## Features

- Sync DB in a loop
- REST API (under constaction)
- Moderation UI (under construction)

## Requirements

- PostgreSQL (v16) for database
- Node.JS (v20) as runtime

## Install and start

Clone the project

```bash
  git clone https://github.com/kugimiya/epds
```

Go to the project directory

```bash
  cd epds
```

Install dependencies

```bash
  npm install
```

Tune config (set creds for db)

```bash
  cp .env.example .env
  vim .env
```

Migrate db

```bash
  npm run migrate up
```

Start

```bash
  npm run start
```

Help

```bash
  npm run start -- --help
```

## Development

### How to create migrations

Just run this command:

```bash
  npm run migrate create your-migration-name
```
