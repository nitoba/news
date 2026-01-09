import { AsyncLocalStorage } from 'async_hooks'

interface DrizzleTiming {
	model: string
	operation: string
	duration: number
}

export const timingStore = new AsyncLocalStorage<{
	drizzle: DrizzleTiming[]
}>()
