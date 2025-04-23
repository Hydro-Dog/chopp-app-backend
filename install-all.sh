#!/bin/bash

set -e

echo "📦 Обновление пакетов..."
sudo apt-get update -y
sudo apt-get upgrade -y

echo "🧰 Установка Git..."
sudo apt-get install -y git

echo "🐳 Установка Docker..."
sudo apt-get install -y docker.io

echo "🧩 Установка Nginx..."
sudo apt-get install -y nginx

echo "🔧 Установка Docker Compose..."
sudo apt-get install -y docker-compose

echo "⬇️ Установка Node.js и npm..."
# Добавим NodeSource репозиторий для Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "📁 Проверяем и создаём директории..."
for dir in /home/chopp/app-backend /home/chopp/app-admin /home/chopp/app-client; do
  if [ -d "$dir" ]; then
    echo "⚠️  Директория $dir уже существует, пропускаем."
  else
    echo "📂 Создаём $dir ..."
    sudo mkdir -p "$dir"
  fi
done

echo "✅ Всё готово!"
