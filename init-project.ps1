# Скрипт для инициализации нового проекта на основе этого бойлерплейта

Write-Host "🚀 Инициализация нового проекта на основе Hono Backend Boilerplate" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------------" -ForegroundColor Cyan

# Проверка установки Bun
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Bun не установлен. Пожалуйста, установите Bun: https://bun.sh/" -ForegroundColor Red
    exit
}

# Запрос имени проекта
$PROJECT_NAME = Read-Host -Prompt "👉 Введите имя вашего проекта"
if ([string]::IsNullOrEmpty($PROJECT_NAME)) {
    Write-Host "❌ Имя проекта не может быть пустым" -ForegroundColor Red
    exit
}

# Запрос порта для приложения
$APP_PORT = Read-Host -Prompt "👉 Введите порт для приложения (по умолчанию 3000)"
if ([string]::IsNullOrEmpty($APP_PORT)) {
    $APP_PORT = "3000"
}

# Генерация секретного ключа для better-auth
$AUTH_SECRET = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Создание .env файла
@"
# Приложение
APP_NAME=${PROJECT_NAME}
APP_PORT=${APP_PORT}
NODE_ENV=development

# База данных
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/${PROJECT_NAME}_db?schema=public"

# Better Auth
BETTER_AUTH_SECRET="${AUTH_SECRET}"
BETTER_AUTH_URL="http://localhost:${APP_PORT}"
"@ | Out-File -FilePath ".env" -Encoding utf8

Write-Host "✅ Файл .env создан" -ForegroundColor Green

# Обновление package.json
$packageJson = Get-Content -Path "package.json" -Raw
$packageJson = $packageJson -replace '"name": "hono-backend-boilerplate"', "`"name`": `"$PROJECT_NAME`""
$packageJson | Out-File -FilePath "package.json" -Encoding utf8
Write-Host "✅ package.json обновлен" -ForegroundColor Green

# Обновление docker-compose.yml
$dockerCompose = Get-Content -Path "docker-compose.yml" -Raw
$dockerCompose = $dockerCompose -replace "hono_db", "${PROJECT_NAME}_db"
$dockerCompose | Out-File -FilePath "docker-compose.yml" -Encoding utf8
Write-Host "✅ docker-compose.yml обновлен" -ForegroundColor Green

# Установка зависимостей
Write-Host "📦 Установка зависимостей..." -ForegroundColor Yellow
bun install

# Настройка Git
Write-Host "🔄 Настройка Git..." -ForegroundColor Yellow
git init
bun prepare

# Инициализация базы данных
Write-Host "🗄️ Инициализация базы данных..." -ForegroundColor Yellow
bun db:generate

Write-Host "✨ Проект '${PROJECT_NAME}' успешно инициализирован!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Для запуска проекта:" -ForegroundColor Cyan
Write-Host "1. Запустите базу данных: docker compose up -d db" -ForegroundColor White
Write-Host "2. Запустите миграции: bun db:migrate" -ForegroundColor White
Write-Host "3. Запустите проект: bun dev" -ForegroundColor White
Write-Host ""
Write-Host "📝 Документация доступна в README.md" -ForegroundColor Cyan 