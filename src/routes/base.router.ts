import { Hono } from 'hono'
import { logger } from '~/lib/logger'

/**
 * Базовый класс для всех маршрутизаторов
 * Обеспечивает единообразие в создании маршрутов и добавляет полезную функциональность
 */
export class BaseRouter {
	public router: Hono
	private routePath: string

	constructor(path: string = '/') {
		this.router = new Hono()
		this.routePath = path
		this.setupRoutes()

		// Логируем создание маршрутизатора
		logger.debug(`Инициализирован маршрутизатор: ${path}`)
	}

	/**
	 * Абстрактный метод для настройки маршрутов
	 * Должен быть переопределен в дочерних классах
	 */
	protected setupRoutes(): void {}

	/**
	 * Получить экземпляр маршрутизатора Hono
	 */
	public getRouter(): Hono {
		return this.router
	}

	/**
	 * Получить путь маршрутизатора
	 */
	public getPath(): string {
		return this.routePath
	}
}
