import { Context, Next } from 'hono'
import { createLogger, format, transports } from 'winston'

const { combine, timestamp, printf, colorize } = format

type LogEntry = {
	level: string
	message: string
	timestamp: string
	[key: string]: unknown
}

const logFormat = printf(info => {
	const { level, message, timestamp, ...meta } = info as LogEntry
	const metadata = Object.keys(meta).length ? JSON.stringify(meta) : ''
	return `[${timestamp}] ${level}: ${message} ${metadata}`
})

// Создаем базовую конфигурацию логгера
const logger = createLogger({
	level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
	format: combine(
		timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		format.errors({ stack: true }),
		logFormat,
	),
	defaultMeta: { service: process.env.APP_NAME || 'hono-app' },
	transports: [
		// Логирование в консоль для разработки
		new transports.Console({
			format: combine(colorize(), logFormat),
		}),
	],
})

// В production добавляем логирование в файлы
if (process.env.NODE_ENV === 'production') {
	logger.add(
		new transports.File({ filename: 'logs/error.log', level: 'error' }),
	)
	logger.add(new transports.File({ filename: 'logs/combined.log' }))
}

export { logger }

// Middleware для логирования запросов в Hono
export const loggerMiddleware = async (ctx: Context, next: Next) => {
	const start = Date.now()
	const { method, url } = ctx.req
	const ip = ctx.req.header('x-forwarded-for') || ctx.req.header('x-real-ip')

	logger.debug(`Request started: ${method} ${url}`, { ip })

	try {
		await next()
	} catch (err: unknown) {
		const responseTime = Date.now() - start
		const errorMessage = err instanceof Error ? err.message : String(err)
		const errorStack = err instanceof Error ? err.stack : undefined

		logger.error(`Request failed: ${method} ${url}`, {
			error: errorMessage,
			stack: errorStack,
			responseTime,
			ip,
		})
		throw err
	}

	const status = ctx.res.status
	const responseTime = Date.now() - start

	// Логируем результат запроса с разным уровнем в зависимости от статуса
	const logLevel = status >= 400 ? (status >= 500 ? 'error' : 'warn') : 'info'

	logger[logLevel](`${method} ${url} ${status}`, {
		responseTime,
		ip,
	})
}
