#!/bin/bash
set -e  # Остановить скрипт при ошибке

echo
echo "🚀 [1] Обновление backend"
cd /home/chopp/app-backend/chopp-app-backend/

echo "🔄 [1.1] Получение свежих данных из Git..."
GIT_BACKEND=$(git pull origin main)
echo "$GIT_BACKEND"

if [[ "$GIT_BACKEND" == "Already up to date." ]]; then
  echo "✅ [1.2] Нет изменений, пропускаем пересборку контейнеров."
else
  echo "🛑 [1.2] Остановка старых Docker-контейнеров..."
  docker-compose -f docker-compose.production.yml down
  echo "🐳 [1.3] Сборка и запуск Docker-контейнеров..."
  docker-compose -f docker-compose.production.yml up -d --build
fi

echo
echo "🛠️ [2] Обновление admin-frontend"
cd /home/chopp/app-admin/chopp-app-admin/

echo "🔄 [2.1] Получение свежих данных из Git..."
GIT_ADMIN=$(git pull origin main)
echo "$GIT_ADMIN"

if [[ "$GIT_ADMIN" == "Already up to date." ]]; then
  echo "✅ [2.2] Нет изменений, пропускаем установку зависимостей, сборку и копирование."
else
  echo "🔄 [2.2] Установка зависимостей..."
  npm i
  echo "🏗️ [2.3] Сборка проекта (игнорируя ошибки TS)..."
  npm run build-ignore-ts
  echo "🧹 [2.4] Очистка папки /var/www/frontend-admin/..."
  sudo rm -rf /var/www/frontend-admin/*
  echo "📦 [2.5] Копирование новой сборки admin..."
  sudo cp -r dist/* /var/www/frontend-admin/
fi

echo
echo "🛠️ [3] Обновление client-frontend"
cd /home/chopp/app-client/chopp-app-client/

echo "🔄 [3.1] Получение свежих данных из Git..."
GIT_CLIENT=$(git pull origin main)
echo "$GIT_CLIENT"

if [[ "$GIT_CLIENT" == "Already up to date." ]]; then
  echo "✅ [3.2] Нет изменений, пропускаем установку зависимостей, сборку и копирование."
else
  echo "🔄 [3.2] Установка зависимостей..."
  npm i
  echo "🏗️ [3.3] Сборка проекта (игнорируя ошибки TS)..."
  npm run build-ignore-ts
  echo "🧹 [3.4] Очистка папки /var/www/frontend-client/..."
  sudo rm -rf /var/www/frontend-client/*
  echo "📦 [3.5] Копирование новой сборки client..."
  sudo cp -r dist/* /var/www/frontend-client/
fi

echo
echo "🔄 [4] Проверка конфигурации Nginx и перезагрузка..."
sudo nginx -t && sudo systemctl reload nginx

echo
echo "✅🎉 Деплой завершён успешно! 🎉✅"
