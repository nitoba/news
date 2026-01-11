import {
	InsertSheltersSchema,
	SelectSheltersSchema,
	UpdateSheltersSchema,
} from 'src/lib/validators'
import { z } from 'zod'
import { ShelterService } from '@/lib/services/shelter-service'
import { protectedProcedure, publicProcedure } from '../..'

const listShelters = publicProcedure()
	.output(z.array(SelectSheltersSchema))
	.handler(async () => {
		return await ShelterService.getAll()
	})

const getShelters = publicProcedure()
	.input(z.object({ id: z.uuid() }))
	.output(SelectSheltersSchema.nullable())
	.handler(async ({ input }) => {
		return await ShelterService.getById(input.id)
	})

const createShelters = protectedProcedure()
	.input(InsertSheltersSchema)
	.output(SelectSheltersSchema)
	.handler(async ({ input }) => {
		return await ShelterService.create(input)
	})

const updateShelters = protectedProcedure()
	.input(z.object({ id: z.uuid(), data: UpdateSheltersSchema }))
	.output(SelectSheltersSchema)
	.handler(async ({ input }) => {
		return await ShelterService.update(input.id, input.data)
	})

const deleteShelters = protectedProcedure()
	.input(z.object({ id: z.uuid() }))
	.output(z.boolean())
	.handler(async ({ input }) => {
		return await ShelterService.delete(input.id)
	})

export const shelters = {
	list: listShelters,
	get: getShelters,
	create: createShelters,
	update: updateShelters,
	delete: deleteShelters,
}
