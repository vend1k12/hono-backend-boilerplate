import { PrismaClient } from '@prisma/client'
import { env } from './env'
import { logger } from './logger'

/**
 * Глобальный тип для хранения экземпляра PrismaClient
 */
interface GlobalWithPrisma {
	prisma: PrismaClient | undefined
}

// Приведение глобального объекта к нашему типу
const globalForPrisma = globalThis as unknown as GlobalWithPrisma

/**
 * Глобальный экземпляр PrismaClient
 * Используется для предотвращения создания множества экземпляров PrismaClient в development режиме
 */
export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log:
			env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
	})

// Сохраняем экземпляр в глобальном объекте в development режиме
if (env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma
}

/**
 * Установка соединения с базой данных
 * @returns Promise<void>
 */
export const connectDB = async (): Promise<void> => {
	try {
		await prisma.$connect()
		logger.info('Подключение к базе данных установлено')
	} catch (error) {
		logger.error('Не удалось подключиться к базе данных', {
			error: String(error),
		})
		process.exit(1)
	}
}

/**
 * Закрытие соединения с базой данных
 * @returns Promise<void>
 */
export const disconnectDB = async (): Promise<void> => {
	try {
		await prisma.$disconnect()
		logger.info('Соединение с базой данных закрыто')
	} catch (error) {
		logger.error('Ошибка при закрытии соединения с базой данных', {
			error: String(error),
		})
		process.exit(1)
	}
}
