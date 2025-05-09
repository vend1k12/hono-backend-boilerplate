import { serve } from 'bun'
import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

import { auth } from '~/lib/auth'
import { connectDB, disconnectDB } from '~/lib/db'
import { env } from '~/lib/env'
import { AppError, errorHandler } from '~/lib/errors'
import { logger as appLogger, loggerMiddleware } from '~/lib/logger'
import { apiRoutes } from '~/routes'

// Инициализируем приложение
const app = new Hono()

// Подключаемся к базе данных
connectDB()

// Обработка сигналов завершения
const shutdown = async () => {
	appLogger.info('Завершаем работу приложения...')
	await disconnectDB()
	process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

// Настройка CORS - использовать переменные окружения
app.use(
	'*',
	cors({
		origin: env.BETTER_AUTH_URL,
		allowHeaders: ['Content-Type', 'Authorization'],
		allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
		exposeHeaders: ['Content-Length'],
		maxAge: 600,
		credentials: true,
	}),
)

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', loggerMiddleware)

// Маршруты API
app.route('/api', apiRoutes)

// Обработка аутентификации
app.on(['POST', 'GET'], '/api/auth/*', c => auth.handler(c.req.raw))

// Обработка 404
app.notFound(c => {
	return c.json(
		{
			status: 'error',
			message: 'Ресурс не найден',
		},
		404,
	)
})

// Глобальный обработчик ошибок
app.onError((err, c) => {
	if (err instanceof AppError) {
		return errorHandler(err, c)
	}

	// Для прочих ошибок
	return errorHandler(new Error(String(err)), c)
})

// Запускаем сервер
const isProd = import.meta.env?.PROD || process.env.NODE_ENV === 'production'

if (isProd) {
	serve({
		fetch: app.fetch,
		port: env.APP_PORT,
	})
	appLogger.info(
		`🚀 Сервер запущен в production режиме на порту ${env.APP_PORT}`,
	)
} else {
	// В режиме разработки Bun.serve будет вызван через команду bun run --hot
	appLogger.info(
		`🚀 Сервер запущен в режиме разработки на порту ${env.APP_PORT}`,
	)
}

// Экспортируем для Bun
export default {
	port: env.APP_PORT,
	fetch: app.fetch,
}
