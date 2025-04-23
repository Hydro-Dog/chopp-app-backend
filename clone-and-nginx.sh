#!/bin/bash

set -e

echo "🐘 Клонируем бэкенд в /home/chopp/app-backend..."
mkdir -p /home/chopp/app-backend
cd /home/chopp/app-backend
git clone https://github.com/Unique-Programmer/chopp-app-server.git

echo "🛠️ Клонируем админку в /home/chopp/app-admin..."
mkdir -p /home/chopp/app-admin
cd /home/chopp/app-admin
git clone https://github.com/Hydro-Dog/chopp-app-admin.git

echo "🌐 Клонируем клиент в /home/chopp/app-client..."
mkdir -p /home/chopp/app-client
cd /home/chopp/app-client
git clone https://github.com/Hydro-Dog/chopp-app-client.git

echo "📝 Обновляем конфиг nginx..."
cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80;
    server_name _;

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }

    # API
    location /api/ {
        rewrite ^/api/(.*)\$ /\$1 break;
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Статика
    location /uploads/ {
        root /home/chopp/app-backend/chopp-app-server/;
        autoindex on;
        access_log off;
        expires max;
    }

    # Клиент
    location / {
        root /var/www/frontend-client;
        index index.html;
        try_files \$uri /index.html;
    }
}

server {
    listen 81;
    server_name _;

    # Проксируем бэкенд через /api
    location /api/ {
        rewrite ^/api/(.*)\$ /\$1 break;
        #proxy_pass http://localhost:6001;
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Раздаём статические файлы (изображения) из папки /uploads
    location /uploads {
        alias /home/chopp/app-backend/chopp-app-server/;
        autoindex on;
        access_log off;
        expires max;
    }

    location / {
        root /var/www/frontend-admin;
        index index.html;
        try_files \$uri /index.html;
    }
}
EOF

echo "✅ Всё готово! Скрипт выполнен успешно."
