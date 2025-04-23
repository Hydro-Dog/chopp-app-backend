#!/bin/sh
set -e

echo "📦 Применяем миграции..."
npm run migrate:prod

echo "🌱 Запускаем сиды..."
npx sequelize-cli db:seed:all

echo "🏗️ Билдим сервер..."
exec npm run start:built

echo "🚀 Стартуем сервер..."
exec npm run start:prod
