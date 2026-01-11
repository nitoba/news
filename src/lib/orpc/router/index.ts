import type { InferRouterInputs, InferRouterOutputs } from '@orpc/server'
import { adoptionRequests } from './routes/adoption-requests'
import { animals } from './routes/animals'
import { shelters } from './routes/shelters'

export type Router = typeof router
export type Inputs = InferRouterInputs<typeof router>
export type Outputs = InferRouterOutputs<typeof router>

export const router = {
	adoptionRequests: adoptionRequests,
	animals: animals,
	shelters: shelters,
}
