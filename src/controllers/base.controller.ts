import { Context } from 'hono'
import { logger } from '~/lib/logger'
import { ApiResponse } from '~/types'

/**
 * Базовый класс для всех контроллеров
 * Обеспечивает стандартные методы для работы с ответами API
 */
export abstract class BaseController {
	/**
	 * Отправить успешный ответ
	 */
	protected static success<T>(
		c: Context,
		data?: T,
		message?: string,
	): Response {
		const response: ApiResponse<T> = {
			status: 'success',
			timestamp: new Date().toISOString(),
		}

		if (data) {
			response.data = data
		}

		if (message) {
			response.message = message
		}

		return c.json(response)
	}

	/**
	 * Отправить ответ с ошибкой
	 */
	protected static error(
		c: Context,
		message: string,
		status: number = 400,
		error?: any,
	): Response {
		if (error) {
			logger.error(message, { error })
		}

		const response: ApiResponse = {
			status: 'error',
			message,
			timestamp: new Date().toISOString(),
		}

		return c.json(response, status as any)
	}
}
