#!/bin/bash
# 1. Сборка Фронтенда
echo "Install & Build Frontend..."
cd frontend
npm install
npm run build
cd ..
# 2. Установка зависимостей Бэкенда
echo "Install Backend..."
cd backend
npm install
# 3. Запуск сервера
echo "Starting Server..."
node index.js
