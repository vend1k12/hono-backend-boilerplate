import { z } from 'zod'
import { logger } from './logger'

/**
 * Схема для валидации переменных окружения
 * Добавляйте новые переменные окружения здесь с соответствующей валидацией
 */
const envSchema = z.object({
	// Настройки приложения
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),
	APP_NAME: z.string().default('hono-app'),
	APP_PORT: z.string().transform(Number).default('3000'),

	// Настройки базы данных
	DATABASE_URL: z.string(),

	// Настройки аутентификации
	BETTER_AUTH_SECRET: z.string().min(32),
	BETTER_AUTH_URL: z.string().url(),

	// Опциональные настройки (могут быть добавлены при необходимости)
	APP_DOMAIN: z.string().optional(),
	CORS_ORIGINS: z
		.string()
		.optional()
		.transform(val => (val ? val.split(',') : [])),
})

/**
 * Тип для переменных окружения
 */
export type Env = z.infer<typeof envSchema>

/**
 * Функция для валидации переменных окружения
 * @returns Валидированные переменные окружения
 */
export const validateEnv = (): Env => {
	try {
		// Загружаем и валидируем переменные окружения
		const env = envSchema.parse(process.env)

		// Логируем успешную загрузку
		logger.info('Переменные окружения успешно загружены')

		return env
	} catch (error) {
		// Если есть ошибки валидации, логируем их и завершаем процесс
		if (error instanceof z.ZodError) {
			const missingVars = error.errors
				.filter(e => e.message === 'Required')
				.map(e => e.path.join('.'))

			const invalidVars = error.errors
				.filter(e => e.message !== 'Required')
				.map(e => ({
					path: e.path.join('.'),
					message: e.message,
				}))

			logger.error('Ошибка валидации переменных окружения:', {
				missingVars: missingVars.length ? missingVars : undefined,
				invalidVars: invalidVars.length ? invalidVars : undefined,
			})
		} else {
			logger.error('Неизвестная ошибка при загрузке переменных окружения:', {
				error: String(error),
			})
		}

		process.exit(1)
	}
}

/**
 * Экспортируем валидированные переменные окружения
 */
export const env = validateEnv()
