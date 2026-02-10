#!/bin/bash

# Скрипт для обновления зависимостей во всех пакетах монорепы (pnpm workspace)

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "🔄 Обновление зависимостей в монорепе (packages/*)..."

# Проверяем наличие npm-check-updates
if ! command -v ncu &> /dev/null; then
    echo "📦 Установка npm-check-updates глобально..."
    npm install -g npm-check-updates
fi

# Проверяем наличие pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm не найден. Установите: npm install -g pnpm"
    exit 1
fi

# Обновляем package.json в каждом пакете
for pkg in packages/shared packages/backend packages/frontend; do
    echo ""
    echo "📦 Обновление зависимостей в $pkg..."
    (cd "$pkg" && ncu -u)
done

# Одна установка из корня — обновляет lockfile и node_modules для всех workspace
echo ""
echo "📦 Установка зависимостей (pnpm install из корня)..."
pnpm install

echo ""
echo "✅ Обновление завершено!"
