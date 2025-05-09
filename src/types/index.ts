/**
 * Индексный файл для типов и интерфейсов
 * Здесь экспортируются все общие типы для использования в приложении
 */

// Базовый интерфейс для ответов API
export interface ApiResponse<T = any> {
	status: 'success' | 'error'
	message?: string
	data?: T
	timestamp: string
}

// Другие общие типы
// export * from './user.types'
// export * from './auth.types'
