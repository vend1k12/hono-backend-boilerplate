import { OpenAPIHono } from '@hono/zod-openapi'
import { Handler } from 'hono'
import { HealthController } from '~/controllers'
import { catchAsync } from '~/lib/errors'
import {
	getExtendedHealthRoute,
	getHealthRoute,
} from '~/models/schemas/health.schema'

/**
 * Маршрутизатор для эндпоинтов проверки работоспособности
 */
const healthRouter = new OpenAPIHono()

// Базовая проверка работоспособности
healthRouter.openapi(
	getHealthRoute,
	catchAsync(c => HealthController.getHealth(c)) as Handler,
)

// Расширенная проверка работоспособности
healthRouter.openapi(
	getExtendedHealthRoute,
	catchAsync(c => HealthController.getExtendedHealth(c)) as Handler,
)

export { healthRouter }
