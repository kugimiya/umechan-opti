#!/bin/bash

# Скрипт для обновления всех зависимостей в проектах

echo "🔄 Обновление зависимостей во всех пакетах..."

# Проверяем наличие npm-check-updates
if ! command -v ncu &> /dev/null; then
    echo "📦 Установка npm-check-updates..."
    npm install -g npm-check-updates
fi

# Обновляем зависимости в backend
echo ""
echo "📦 Обновление зависимостей в backend..."
cd packages/backend
ncu -u
npm install
cd ../..

# Обновляем зависимости в frontend
echo ""
echo "📦 Обновление зависимостей в frontend..."
cd packages/frontend
ncu -u
npm install
cd ../..

echo ""
echo "✅ Обновление завершено!"

