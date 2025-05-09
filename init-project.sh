#!/usr/bin/env bash

# Скрипт для инициализации нового проекта на основе этого бойлерплейта

echo "🚀 Инициализация нового проекта на основе Hono Backend Boilerplate"
echo "--------------------------------------------------------------"

# Проверка установки Bun
if ! command -v bun &> /dev/null; then
  echo "❌ Bun не установлен. Пожалуйста, установите Bun: https://bun.sh/"
  exit 1
fi

# Запрос имени проекта
read -p "👉 Введите имя вашего проекта: " PROJECT_NAME
if [ -z "$PROJECT_NAME" ]; then
  echo "❌ Имя проекта не может быть пустым"
  exit 1
fi

# Запрос порта для приложения
read -p "👉 Введите порт для приложения (по умолчанию 3000): " APP_PORT
APP_PORT=${APP_PORT:-3000}

# Генерация секретного ключа для better-auth
AUTH_SECRET=$(openssl rand -base64 32)

# Создание .env файла
cat > .env << EOL
# Приложение
APP_NAME=${PROJECT_NAME}
APP_PORT=${APP_PORT}
NODE_ENV=development

# База данных
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/${PROJECT_NAME}_db?schema=public"

# Better Auth
BETTER_AUTH_SECRET="${AUTH_SECRET}"
BETTER_AUTH_URL="http://localhost:${APP_PORT}"
EOL

echo "✅ Файл .env создан"

# Обновление package.json
sed -i "s/\"name\": \"hono-backend-boilerplate\"/\"name\": \"${PROJECT_NAME}\"/" package.json
echo "✅ package.json обновлен"

# Обновление docker-compose.yml
sed -i "s/hono_db/${PROJECT_NAME}_db/g" docker-compose.yml
echo "✅ docker-compose.yml обновлен"

# Установка зависимостей
echo "📦 Установка зависимостей..."
bun install

# Настройка Git
echo "🔄 Настройка Git..."
git init
bun prepare

# Инициализация базы данных
echo "🗄️ Инициализация базы данных..."
bun db:generate

echo "✨ Проект \"${PROJECT_NAME}\" успешно инициализирован!"
echo ""
echo "🚀 Для запуска проекта:"
echo "1. Запустите базу данных: docker compose up -d db"
echo "2. Запустите миграции: bun db:migrate"
echo "3. Запустите проект: bun dev"
echo ""
echo "📝 Документация доступна в README.md" 