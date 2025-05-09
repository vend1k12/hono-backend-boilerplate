import { HealthController } from '~/controllers'
import { catchAsync } from '~/lib/errors'
import { BaseRouter } from '~/routes/base.router'

/**
 * Маршрутизатор для эндпоинтов проверки работоспособности
 */
export class HealthRouter extends BaseRouter {
	constructor() {
		super('/health')
	}

	/**
	 * Настройка маршрутов
	 */
	protected setupRoutes(): void {
		// Базовая проверка работоспособности
		this.router.get('/', c => HealthController.getHealth(c))

		// Расширенная проверка работоспособности
		this.router.get(
			'/extended',
			catchAsync(c => HealthController.getExtendedHealth(c)),
		)
	}
}

// Создаем и экспортируем экземпляр маршрутизатора
export const healthRouter = new HealthRouter().getRouter()
