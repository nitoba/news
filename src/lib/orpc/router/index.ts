import type { InferRouterInputs, InferRouterOutputs } from '@orpc/server'
import { list } from './routes/list'

export type Router = typeof router
export type Inputs = InferRouterInputs<typeof router>
export type Outputs = InferRouterOutputs<typeof router>

export const router = {
	list,
}
