#!/bin/bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
# Install Node.js and npm
nvm install --lts
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
