import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from '@/env.ts'
import { timingStore } from '@/lib/timing-store'
import * as schema from './schemas/index.ts'

function createDrizzle() {
	const client = drizzle(env.DATABASE_URL, { schema })

	// Wrap all query methods to add server timing
	const db = new Proxy(client, {
		get(target, prop) {
			const original = Reflect.get(target, prop)

			// Only wrap function properties (query methods)
			if (typeof original !== 'function') {
				return original
			}

			// Get model name from the property name
			const modelName = String(prop)

			return async (...args: unknown[]) => {
				const start = performance.now()

				let result: unknown
				try {
					result = await original.apply(target, args)
				} catch (error) {
					const duration = performance.now() - start

					const store = timingStore.getStore()
					if (store) {
						store.drizzle.push({
							model: modelName,
							operation: 'query',
							duration,
						})
					}

					throw error
				}

				const duration = performance.now() - start

				const store = timingStore.getStore()
				if (store) {
					store.drizzle.push({
						model: modelName,
						operation: 'query',
						duration,
					})
				}

				return result
			}
		},
	})

	return db
}

const globalForDrizzle = globalThis as unknown as {
	db: ReturnType<typeof createDrizzle> | undefined
}

export const db = globalForDrizzle.db ?? createDrizzle()

if (import.meta.env.DEV) globalForDrizzle.db = db
