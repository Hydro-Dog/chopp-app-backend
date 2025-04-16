#!/bin/bash
set -e

echo "📁 Создаём директории..."
mkdir -p /home/chopp/app-frontend-client

echo "🌐 Переходим в директорию..."
cd /home/chopp/app-frontend-client

echo "🔽 Клонируем репозиторий админки..."
git clone https://github.com/Hydro-Dog/chopp-app-client.git

echo "📁 Переход в проект..."
cd chopp-app-client

echo "📄 Вставь содержимое .env.production (заверши ввод CTRL+D):"
cat > .env.production

echo "📦 Устанавливаем зависимости..."
npm install

echo "🛠 Собираем проект..."
npm run build-ignore-ts

echo "🧹 Очищаем директорию продакшн-деплоя..."
sudo rm -rf /var/www/frontend-client/*
sudo mkdir -p /var/www/frontend-client/

echo "📂 Копируем билд в /var/www/frontend-client/..."
sudo cp -r dist/* /var/www/frontend-client/

echo "✅ Админка успешно задеплоена!"
