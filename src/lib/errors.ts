import { Context } from 'hono'
import { logger } from './logger'

// Базовый класс ошибок приложения
export class AppError extends Error {
	statusCode: number
	isOperational: boolean

	constructor(message: string, statusCode: number) {
		super(message)
		this.statusCode = statusCode
		this.isOperational = true

		Error.captureStackTrace(this, this.constructor)
	}
}

// Тип ошибки для 404 Not Found
export class NotFoundError extends AppError {
	constructor(message = 'Ресурс не найден') {
		super(message, 404)
	}
}

// Тип ошибки для 400 Bad Request
export class BadRequestError extends AppError {
	constructor(message = 'Неверный запрос') {
		super(message, 400)
	}
}

// Тип ошибки для 401 Unauthorized
export class UnauthorizedError extends AppError {
	constructor(message = 'Не авторизован') {
		super(message, 401)
	}
}

// Тип ошибки для 403 Forbidden
export class ForbiddenError extends AppError {
	constructor(message = 'Доступ запрещен') {
		super(message, 403)
	}
}

// Тип ошибки для 500 Internal Server Error
export class InternalServerError extends AppError {
	constructor(message = 'Внутренняя ошибка сервера') {
		super(message, 500)
	}
}

// Middleware для обработки ошибок
export const errorHandler = async (err: Error, c: Context) => {
	// Если это наша операционная ошибка, отправляем соответствующий ответ
	if (err instanceof AppError) {
		logger.warn(`Операционная ошибка: ${err.message}`, {
			statusCode: err.statusCode,
			stack: err.stack,
		})

		return c.json(
			{
				status: 'error',
				message: err.message,
			},
			err.statusCode as any,
		)
	}

	// Непредвиденная ошибка - логируем и возвращаем 500
	logger.error(`Непредвиденная ошибка: ${err.message}`, {
		stack: err.stack,
	})

	// В production не возвращаем детали ошибки клиенту
	const message =
		process.env.NODE_ENV === 'production' ? 'Что-то пошло не так' : err.message

	return c.json(
		{
			status: 'error',
			message,
			...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
		},
		500 as any,
	)
}

// Функция для отлова асинхронных ошибок в маршрутах
export const catchAsync = (fn: (c: Context) => Promise<Response>) => {
	return async (c: Context) => {
		try {
			return await fn(c)
		} catch (err) {
			// Обрабатываем ошибку через errorHandler
			if (err instanceof Error) {
				return errorHandler(err, c)
			}
			// Если это не Error, создаем новую ошибку
			return errorHandler(new Error(String(err)), c)
		}
	}
}
