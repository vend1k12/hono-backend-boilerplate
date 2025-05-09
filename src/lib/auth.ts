import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { openAPI } from 'better-auth/plugins'
import { admin } from 'better-auth/plugins/admin'
import { passkey } from 'better-auth/plugins/passkey'
import { username } from 'better-auth/plugins/username'
import { Context } from 'hono'

import { prisma } from './db'
import { env } from './env'
import { UnauthorizedError } from './errors'
import { logger } from './logger'

/**
 * Конфигурация аутентификации
 */
export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	fetchOptions: {
		credentials: 'include',
	},
	appName: env.APP_NAME,
	baseURL: env.BETTER_AUTH_URL,
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
	},
	rateLimit: {
		enabled: true,
		limit: 10,
		window: 60 * 1000,
	},
	advanced: {
		ipAddress: {
			ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
			disableIpTracking: false,
		},
		// Раскомментировать при необходимости использования поддоменов
		// crossSubDomainCookies: {
		// 	enabled: true,
		// 	subDomain: env.APP_DOMAIN,
		// },
		cookiePrefix: env.APP_NAME,
	},
	databaseHooks: {
		user: {
			create: {
				after: async user => {
					try {
						const userCount = await prisma.user.count()
						// Если это первый пользователь, назначаем ему роль администратора
						if (userCount === 1) {
							await prisma.user.update({
								where: { id: user.id },
								data: { role: 'admin' },
							})
							logger.info(
								`Пользователь ${user.id} назначен администратором как первый пользователь в системе`,
							)
						}
					} catch (error) {
						logger.error('Ошибка при назначении роли администратора', {
							userId: user.id,
							error: String(error),
						})
					}
				},
			},
		},
	},
	plugins: [
		username(),
		passkey(),
		admin({
			adminRoles: ['admin', 'moderator'],
			defaultRole: 'user',
		}),
		openAPI(),
	],
})

/**
 * Middleware для проверки аутентификации
 * @param c - Контекст Hono
 * @returns Сессия пользователя
 * @throws UnauthorizedError если пользователь не авторизован
 */
export const requireAuth = async (c: Context) => {
	try {
		const session = await auth.api.getSession(c.req.raw)
		if (!session) {
			throw new UnauthorizedError('Требуется авторизация')
		}
		return session
	} catch (error) {
		logger.error('Ошибка при проверке аутентификации', {
			error: String(error),
		})
		throw new UnauthorizedError('Требуется авторизация')
	}
}
