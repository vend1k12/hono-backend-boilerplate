import { OpenAPIHono } from '@hono/zod-openapi'
import { Hono } from 'hono'

import { addSwaggerUI, openApiConfig } from '~/lib/openapi'
import { healthRouter } from './health'

/**
 * Типы маршрутов для регистрации
 */
type Routes = Record<string, Hono | OpenAPIHono>

/**
 * Создаем основной маршрутизатор API с поддержкой OpenAPI
 */
const apiRoutes = new OpenAPIHono()

/**
 * Настраиваем Swagger UI
 */
addSwaggerUI(apiRoutes)

/**
 * Все доступные маршруты API
 * Добавление нового маршрутизатора происходит здесь
 */
const routes: Routes = {
	'/health': healthRouter,
}

/**
 * Регистрируем все определенные маршруты
 */
Object.entries(routes).forEach(([path, router]) => {
	apiRoutes.route(path, router as Hono)
})

/**
 * Генерируем документацию OpenAPI
 */
apiRoutes.doc('/docs', {
	openapi: '3.0.0',
	...openApiConfig,
})

/**
 * Экспортируем маршрутизатор API
 */
export { apiRoutes }

/**
 * Вспомогательная функция для регистрации маршрутов
 * @param baseRouter - Базовый маршрутизатор
 * @param routes - Маршруты для регистрации
 */
export function registerRoutes(
	baseRouter: Hono | OpenAPIHono,
	routes: Routes,
): void {
	Object.entries(routes).forEach(([path, router]) => {
		;(baseRouter as Hono).route(path, router as Hono)
	})
}
