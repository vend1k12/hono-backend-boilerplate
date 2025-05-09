import { createRoute, z } from '@hono/zod-openapi'
import { apiResponses } from '~/lib/openapi'

/**
 * Схема ответа для проверки работоспособности
 */
const healthResponseSchema = z.object({
	status: z.literal('success').optional(),
	message: z.string().optional(),
	data: z.any().nullable(),
})

/**
 * Схема ответа для расширенной проверки работоспособности
 */
const extendedHealthResponseSchema = z.object({
	status: z.literal('success').optional(),
	message: z.string().optional(),
	data: z.object({
		checks: z.object({
			api: z.object({
				status: z.string(),
			}),
			database: z.object({
				status: z.string(),
				responseTime: z.string(),
			}),
		}),
	}),
})

/**
 * Маршрут для базовой проверки работоспособности
 */
export const getHealthRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['health'],
	summary: 'Проверка работоспособности API',
	description: 'Базовая проверка работоспособности API',
	responses: {
		200: {
			description: 'API работает',
			content: {
				'application/json': {
					schema: healthResponseSchema,
				},
			},
		},
		500: apiResponses.Error500,
	},
})

/**
 * Маршрут для расширенной проверки работоспособности
 */
export const getExtendedHealthRoute = createRoute({
	method: 'get',
	path: '/extended',
	tags: ['health'],
	summary: 'Расширенная проверка работоспособности',
	description: 'Проверка работоспособности API и базы данных',
	responses: {
		200: {
			description: 'Все системы работают',
			content: {
				'application/json': {
					schema: extendedHealthResponseSchema,
				},
			},
		},
		500: apiResponses.Error500,
	},
})
