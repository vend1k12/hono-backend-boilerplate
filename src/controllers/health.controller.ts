import { Context } from 'hono'

import { BaseController } from '~/controllers/base.controller'
import { prisma } from '~/lib/db'
import { logger } from '~/lib/logger'

/**
 * Контроллер для проверок работоспособности системы
 */
export class HealthController extends BaseController {
	/**
	 * Базовая проверка работоспособности API
	 */
	public static async getHealth(c: Context) {
		return c.json({
			status: 'success' as const,
			message: 'API работает!',
			data: null,
		})
	}

	/**
	 * Расширенная проверка работоспособности с проверкой соединения с БД
	 */
	public static async getExtendedHealth(c: Context) {
		try {
			// Проверяем соединение с базой данных
			const dbStart = Date.now()
			await prisma.$queryRaw`SELECT 1`
			const dbDuration = Date.now() - dbStart

			logger.info('Выполнена расширенная проверка работоспособности', {
				dbResponseTime: dbDuration,
			})

			return c.json({
				status: 'success' as const,
				message: 'Все системы работают',
				data: {
					checks: {
						api: {
							status: 'ok',
						},
						database: {
							status: 'ok',
							responseTime: `${dbDuration}ms`,
						},
					},
				},
			})
		} catch (error) {
			return c.json(
				{
					status: 'error' as const,
					message: 'Ошибка при проверке работоспособности системы',
				},
				500,
			)
		}
	}
}
