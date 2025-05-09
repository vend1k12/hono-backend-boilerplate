# 🚀 Hono Backend Boilerplate

Современный и мощный шаблон бэкенда на Hono.js, Bun и Prisma с полной интеграцией аутентификации, логирования и валидации.

## ✨ Основные особенности

- 🛡️ Встроенная аутентификация через [better-auth](https://github.com/better-auth/better-auth)
- 🔄 ORM [Prisma](https://www.prisma.io/) для взаимодействия с базой данных
- 📝 Структурированное логирование с [Winston](https://github.com/winstonjs/winston)
- ✅ Валидация данных с [Zod](https://github.com/colinhacks/zod)
- 🌐 REST API с [Hono.js](https://hono.dev/)
- 🚦 Обработка ошибок и промежуточное ПО
- 🔍 ESLint + Prettier для статического анализа и форматирования кода
- 🔄 CI/CD через GitHub Actions
- 🔒 Husky и lint-staged для предкоммитных проверок
- ⚡ [Bun](https://bun.sh/) для быстрой разработки и выполнения
- 🐳 Docker и Docker Compose для контейнеризации

## 🛠️ Технологии

- **Язык:** TypeScript
- **Среда выполнения:** Bun
- **Фреймворк:** Hono.js
- **ORM:** Prisma
- **Логирование:** Winston
- **Валидация:** Zod
- **Аутентификация:** better-auth
- **Линтинг:** ESLint + Prettier
- **CI/CD:** GitHub Actions
- **Хуки:** Husky + lint-staged
- **Контейнеризация:** Docker + Docker Compose

## 🚀 Начало работы

### Предварительные требования

- [Bun](https://bun.sh/) (1.0.0 или выше)
- [Docker](https://www.docker.com/) (опционально, для локальной БД)
- [PostgreSQL](https://www.postgresql.org/) (локально или через Docker)

### Установка

1. Клонировать репозиторий:

```bash
git clone https://github.com/yourusername/hono-backend-boilerplate.git
cd hono-backend-boilerplate
```

2. Установить зависимости:

```bash
bun install
```

3. Создать файл `.env` (можно скопировать из `.env.example`):

```bash
cp .env.example .env
```

4. Запустить базу данных (если используется Docker):

```bash
bun docker:up
```

5. Запустить миграции Prisma:

```bash
bun db:migrate
```

6. Сгенерировать клиент Prisma:

```bash
bun db:generate
```

### Запуск в режиме разработки

```bash
bun dev
```

API будет доступен по адресу: http://localhost:3000

## 🔧 Доступные скрипты

### Основные команды

- `bun dev` - Запуск в режиме разработки с горячей перезагрузкой
- `bun build` - Сборка проекта
- `bun start` - Запуск собранного проекта
- `bun test` - Запуск тестов
- `bun types:check` - Проверка типов TypeScript

### Линтеры и форматтеры

- `bun lint` - Проверка кода ESLint
- `bun lint:fix` - Исправление ошибок ESLint
- `bun format` - Форматирование кода с Prettier

### База данных

- `bun db:generate` - Генерация клиента Prisma
- `bun db:migrate` - Запуск миграций для разработки
- `bun db:deploy` - Запуск миграций для продакшн
- `bun db:push` - Быстрое обновление схемы без миграций
- `bun db:studio` - Запуск Prisma Studio
- `bun db:seed` - Заполнение базы тестовыми данными

### Аутентификация

- `bun auth:generate` - Генерация схем better-auth

### Docker

- `bun docker:up` - Запуск контейнеров Docker
- `bun docker:down` - Остановка контейнеров Docker
- `bun docker:build` - Сборка Docker образа

## 📐 Архитектура

Приложение использует модульную архитектуру, которая обеспечивает:

- Масштабируемость
- Тестируемость
- Повторное использование кода
- Разделение ответственности

### Структура проекта

```
src/
├── controllers/         # Контроллеры приложения
├── lib/                 # Общие библиотеки и утилиты
│   ├── auth.ts          # Конфигурация аутентификации
│   ├── db.ts            # Подключение к базе данных
│   ├── env.ts           # Валидация переменных окружения
│   ├── errors.ts        # Обработка ошибок
│   ├── logger.ts        # Настройка логирования
│   └── validation.ts    # Утилиты валидации
├── models/              # Модели данных
├── routes/              # Маршруты API
│   ├── health/          # Модуль проверки работоспособности
│   │   ├── health.controller.ts
│   │   ├── health.router.ts
│   │   └── index.ts
├── services/            # Сервисы бизнес-логики
├── types/               # Типы и интерфейсы
└── index.ts             # Входная точка приложения
```

### Шаблоны проектирования

1. **Модульная архитектура**: каждый модуль содержит контроллер, маршрутизатор и индексный файл
2. **Dependency Injection**: используется для внедрения сервисов
3. **Repository Pattern**: для работы с данными через Prisma
4. **Middleware Pattern**: для обработки запросов
5. **Error Handling**: централизованная обработка ошибок

## 🌐 API Routes

- `GET /api/health` - Базовая проверка работоспособности API
- `GET /api/health/extended` - Расширенная проверка включая соединение с БД
- `/api/auth/*` - Маршруты аутентификации (предоставляются better-auth)

## 📝 Добавление новых модулей

1. Создайте новую директорию в `src/routes/` для вашего модуля
2. Создайте контроллер, маршрутизатор и индексный файл
3. Зарегистрируйте новый маршрутизатор в `src/routes/index.ts`

Пример добавления модуля для пользователей:

```typescript
// src/routes/users/users.controller.ts
import { Context } from 'hono'
import { catchAsync } from '~/lib/errors'
import { prisma } from '~/lib/db'

export class UsersController {
	// Получить всех пользователей
	getUsers = catchAsync(async (c: Context) => {
		const users = await prisma.user.findMany({
			select: { id: true, email: true, name: true },
		})
		return c.json({ users })
	})
}

// src/routes/users/users.router.ts
import { Hono } from 'hono'
import { UsersController } from './users.controller'

const usersRouter = new Hono()
const controller = new UsersController()

usersRouter.get('/', controller.getUsers)

export { usersRouter }

// src/routes/users/index.ts
export { usersRouter } from './users.router'

// Затем в src/routes/index.ts
import { usersRouter } from './users'

const routes: Routes = {
	'/health': healthRouter,
	'/users': usersRouter,
}
```

## 📄 Переменные окружения

Для работы приложения необходимо настроить следующие переменные окружения:

```bash
# Приложение
NODE_ENV=development
APP_NAME=hono-app
APP_PORT=3000

# База данных
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hono_db

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-long
BETTER_AUTH_URL=http://localhost:3000

# Опционально
APP_DOMAIN=localhost
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📦 Лицензия

MIT
