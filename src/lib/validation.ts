import { Context, Next } from 'hono'
import { z } from 'zod'
import { BadRequestError } from './errors'

/**
 * Middleware для валидации входных данных с использованием Zod схем
 *
 * @param schema - схема валидации Zod
 * @returns middleware-функция для Hono
 */
export const validateBody = <T extends z.ZodType>(schema: T) => {
	return async (c: Context, next: Next) => {
		try {
			// Получаем тело запроса
			const body = await c.req.json()

			// Валидируем данные
			const validatedData = schema.parse(body)

			// Сохраняем валидированные данные в контексте
			c.set('validatedBody', validatedData)

			await next()
		} catch (err) {
			// Если это ошибка валидации Zod, форматируем сообщение об ошибке
			if (err instanceof z.ZodError) {
				const errorMessages = err.errors.map(e => ({
					path: e.path.join('.'),
					message: e.message,
				}))

				throw new BadRequestError(
					`Ошибка валидации: ${JSON.stringify(errorMessages)}`,
				)
			}

			// Если это другая ошибка, пробрасываем ее дальше
			throw err
		}
	}
}

/**
 * Middleware для валидации параметров запроса с использованием Zod схем
 *
 * @param schema - схема валидации Zod
 * @returns middleware-функция для Hono
 */
export const validateParams = <T extends z.ZodType>(schema: T) => {
	return async (c: Context, next: Next) => {
		try {
			// Получаем параметры запроса
			const params = c.req.param()

			// Валидируем данные
			const validatedParams = schema.parse(params)

			// Сохраняем валидированные данные в контексте
			c.set('validatedParams', validatedParams)

			await next()
		} catch (err) {
			// Если это ошибка валидации Zod, форматируем сообщение об ошибке
			if (err instanceof z.ZodError) {
				const errorMessages = err.errors.map(e => ({
					path: e.path.join('.'),
					message: e.message,
				}))

				throw new BadRequestError(
					`Ошибка валидации параметров: ${JSON.stringify(errorMessages)}`,
				)
			}

			// Если это другая ошибка, пробрасываем ее дальше
			throw err
		}
	}
}

/**
 * Middleware для валидации query-параметров с использованием Zod схем
 *
 * @param schema - схема валидации Zod
 * @returns middleware-функция для Hono
 */
export const validateQuery = <T extends z.ZodType>(schema: T) => {
	return async (c: Context, next: Next) => {
		try {
			// Получаем query-параметры
			const query = c.req.query()

			// Валидируем данные
			const validatedQuery = schema.parse(query)

			// Сохраняем валидированные данные в контексте
			c.set('validatedQuery', validatedQuery)

			await next()
		} catch (err) {
			// Если это ошибка валидации Zod, форматируем сообщение об ошибке
			if (err instanceof z.ZodError) {
				const errorMessages = err.errors.map(e => ({
					path: e.path.join('.'),
					message: e.message,
				}))

				throw new BadRequestError(
					`Ошибка валидации query-параметров: ${JSON.stringify(errorMessages)}`,
				)
			}

			// Если это другая ошибка, пробрасываем ее дальше
			throw err
		}
	}
}
