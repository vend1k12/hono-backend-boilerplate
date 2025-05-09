import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { env } from './env'

/**
 * Базовая конфигурация OpenAPI для всего приложения
 */
export const openApiConfig = {
	info: {
		title: env.APP_NAME || 'Hono Backend API',
		version: '1.0.0',
		description: 'API документация для Hono Backend',
	},
	servers: [
		{
			url: `${env.BETTER_AUTH_URL}/api`,
			description: 'API server',
		},
	],
}

/**
 * Стандартные ответы API для переиспользования в схемах
 */
export const apiResponses = {
	Success200: {
		description: 'Успешный ответ',
		content: {
			'application/json': {
				schema: z.object({
					status: z.literal('success').optional(),
					data: z.any().optional(),
					message: z.string().optional(),
				}),
			},
		},
	},
	Error401: {
		description: 'Ошибка авторизации',
		content: {
			'application/json': {
				schema: z.object({
					status: z.literal('error'),
					message: z.string(),
				}),
			},
		},
	},
	Error403: {
		description: 'Доступ запрещен',
		content: {
			'application/json': {
				schema: z.object({
					status: z.literal('error'),
					message: z.string(),
				}),
			},
		},
	},
	Error404: {
		description: 'Ресурс не найден',
		content: {
			'application/json': {
				schema: z.object({
					status: z.literal('error'),
					message: z.string(),
				}),
			},
		},
	},
	Error422: {
		description: 'Ошибка валидации',
		content: {
			'application/json': {
				schema: z.object({
					status: z.literal('error'),
					message: z.string(),
					errors: z
						.array(
							z.object({
								path: z.array(z.string()),
								message: z.string(),
							}),
						)
						.optional(),
				}),
			},
		},
	},
	Error500: {
		description: 'Внутренняя ошибка сервера',
		content: {
			'application/json': {
				schema: z.object({
					status: z.literal('error'),
					message: z.string(),
				}),
			},
		},
	},
}

/**
 * Создает Hono приложение с поддержкой OpenAPI
 */
export function createOpenApiApp() {
	return new OpenAPIHono()
}

/**
 * Добавляет Swagger UI к приложению
 * @param app - Экземпляр OpenAPIHono приложения
 */
export function addSwaggerUI(app: OpenAPIHono) {
	app.doc('/docs', {
		openapi: '3.0.0',
		...openApiConfig,
	})

	app.get(
		'/ui',
		swaggerUI({
			url: '/api/docs',
		}),
	)
}

/**
 * Декоратор для OpenAPI маршрутов (для имитации NestJS декораторов)
 * @param options - Параметры декоратора
 */
export function OpenAPI(options: {
	summary?: string
	description?: string
	tags?: string[]
}) {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) {
		const originalMethod = descriptor.value

		// Сохраняем метаданные OpenAPI в методе
		originalMethod.openApiOptions = options

		return descriptor
	}
}

/**
 * Создает типизированный маршрут для OpenAPI
 */
export { createRoute }
