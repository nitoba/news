import { randomUUID } from 'node:crypto'
import { ORPCError, os } from '@orpc/server'
import { logger } from '@/lib/logger'
import { timingStore } from '@/lib/timing-store'
import type { Context } from './context'

export const base = os
	.$context<Context>()
	// Logger
	.use(async ({ next, context, procedure, path }) => {
		context
		const start = performance.now()
		const meta = {
			path: path.join('.'),
			type: procedure['~orpc'].route.method,
			requestId: randomUUID(),
			// userId: context.session?.user?.id,
		}

		const loggerForMiddleWare = logger.child({ ...meta, scope: 'procedure' })

		loggerForMiddleWare.info('Before')

		try {
			const result = await next({
				context: { logger: loggerForMiddleWare },
			})

			const duration = performance.now() - start
			loggerForMiddleWare.info({ durationMs: duration }, 'After')
			context.resHeaders?.append(
				'Server-Timing',
				`global;dur=${duration.toFixed(2)}`,
			)

			return result
		} catch (error) {
			const logLevel = (() => {
				if (!(error instanceof ORPCError)) {
					return 'error'
				}
				if (error.message === 'DEMO_MODE_ENABLED') {
					return 'info'
				}
				const errorCode = error.status
				if (errorCode >= 500) {
					return 'error'
				}
				if (errorCode >= 400) {
					return 'warn'
				}
				if (errorCode >= 300) {
					return 'info'
				}
				return 'error'
			})()

			loggerForMiddleWare[logLevel](error)
			throw error
		}
	})
	// Middleware to add database Server Timing header
	.use(({ next, context }) => {
		return timingStore.run({ drizzle: [] }, async () => {
			const result = await next()

			// Add the Server-Timing header if there are timings
			const serverTimingHeader = timingStore
				.getStore()
				?.drizzle.map(
					(timing) =>
						`db-${timing.model}-${timing.operation};dur=${timing.duration.toFixed(2)}`,
				)
				.join(', ')

			if (serverTimingHeader) {
				context.resHeaders?.append('Server-Timing', serverTimingHeader)
			}

			return result
		})
	})

export const publicProcedure = () => base
