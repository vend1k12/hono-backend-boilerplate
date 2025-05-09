import { Hono } from 'hono'

import { healthRouter } from './health'

/**
 * Типы маршрутов для регистрации
 */
type Routes = Record<string, Hono>

/**
 * Создаем основной маршрутизатор API
 */
export const apiRoutes = new Hono()

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
	apiRoutes.route(path, router)
})

/**
 * Вспомогательная функция для регистрации маршрутов
 * @param baseRouter - Базовый маршрутизатор
 * @param routes - Маршруты для регистрации
 */
export function registerRoutes(baseRouter: Hono, routes: Routes): void {
	Object.entries(routes).forEach(([path, router]) => {
		baseRouter.route(path, router)
	})
}
