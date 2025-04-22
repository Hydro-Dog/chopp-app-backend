#!/bin/bash

set -e

echo "📦 Обновление пакетов..."
sudo apt-get update -y
sudo apt-get upgrade -y

echo "🧰 Установка Git..."
sudo apt-get install -y git

echo "🐳 Установка Docker..."
sudo apt-get install -y docker.io

echo "🔧 Установка Docker Compose..."
sudo apt-get install -y docker-compose

echo "⬇️ Установка Node.js и npm..."
# Добавим NodeSource репозиторий для Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "📁 Создание директорий..."
sudo mkdir -p /home/chopp/app-backend
sudo mkdir -p /home/chopp/app-admin
sudo mkdir -p /home/chopp/app-client

echo "✅ Всё готово!"
