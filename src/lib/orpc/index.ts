import { randomUUID } from 'node:crypto'
import { ORPCError, os } from '@orpc/server'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { logger } from '@/lib/logger'
import {
	adopterPermissions,
	bothPermissions,
	donorPermissions,
	setup,
} from '@/lib/permix'
import { timingStore } from '@/lib/timing-store'
import { auth } from '../auth/server'
import type { Context } from './context'

export const base = os
	.$context<Context>()
	// Logger
	.use(async ({ next, context, procedure, path }) => {
		const start = performance.now()
		const meta = {
			path: path.join('.'),
			type: procedure['~orpc'].route.method,
			requestId: randomUUID(),
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

export const authMiddleware = os
	.$context<Context>()
	.middleware(async ({ context, next }) => {
		const start = performance.now()
		const sessionData = await auth.api.getSession({
			headers: getRequestHeaders(),
		})

		if (!sessionData?.session || !sessionData?.user) {
			throw new ORPCError('UNAUTHORIZED')
		}

		const duration = performance.now() - start

		context.resHeaders?.append(
			'Server-Timing',
			`auth;dur=${duration.toFixed(2)}`,
		)

		// Cria um logger filho com o userId
		// biome-ignore lint/style/noNonNullAssertion: logger is always
		const loggerWithUserId = context?.logger!.child({
			userId: sessionData.user.id,
		})

		// Adds session and user to the context
		return next({
			context: {
				session: sessionData.session,
				user: sessionData.user,
				logger: loggerWithUserId,
			},
		})
	})

const permissionsMiddleware = os
	.$context<Context>()
	.middleware(({ context, next }) => {
		if (!context.user) {
			return next()
		}

		const userType = context.user.userType || 'adopter'
		const userId = context.user.id

		let p: ReturnType<typeof setup>

		switch (userType) {
			case 'adopter':
				p = setup(adopterPermissions(userId))
				break
			case 'donor':
				p = setup(donorPermissions(userId))
				break
			case 'both':
				p = setup(bothPermissions(userId))
				break
			default:
				p = setup(adopterPermissions(userId))
		}

		return next({
			context: {
				...context,
				permix: p,
			},
		})
	})

export const publicProcedure = () => base
export const protectedProcedure = () => base.use(authMiddleware)
export const protectedWithPermissionsProcedure = () =>
	base.use(authMiddleware).use(permissionsMiddleware)
