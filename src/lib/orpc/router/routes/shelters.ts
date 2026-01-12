import { ORPCError } from '@orpc/server'
import {
	InsertSheltersSchema,
	ListSheltersSchema,
	SelectSheltersSchema,
	UpdateSheltersSchema,
} from 'src/lib/validators'
import { z } from 'zod'
import { checkPermissionMiddleware } from '@/lib/permix'
import { ShelterService } from '@/lib/services/shelter-service'
import { protectedWithPermissionsProcedure, publicProcedure } from '../..'

const listShelters = publicProcedure()
	.input(ListSheltersSchema)
	.output(z.array(SelectSheltersSchema))
	.handler(async ({ input }) => {
		return await ShelterService.getAll(input)
	})

const getShelters = publicProcedure()
	.input(z.object({ id: z.uuid() }))
	.output(SelectSheltersSchema.nullable())
	.handler(async ({ input }) => {
		return await ShelterService.getById(input.id)
	})

const createShelters = protectedWithPermissionsProcedure()
	.use(checkPermissionMiddleware('shelters', 'create'))
	.input(InsertSheltersSchema)
	.output(SelectSheltersSchema)
	.handler(async ({ input }) => {
		return await ShelterService.create(input)
	})

const updateShelters = protectedWithPermissionsProcedure()
	.input(z.object({ id: z.uuid(), data: UpdateSheltersSchema }))
	.output(SelectSheltersSchema)
	.handler(async ({ input, context }) => {
		const shelter = await ShelterService.getById(input.id)

		if (!shelter) {
			throw new ORPCError('NOT_FOUND')
		}

		if (!context.permix?.check('shelters', 'update', shelter)) {
			throw new ORPCError('FORBIDDEN')
		}
		return await ShelterService.update(input.id, input.data)
	})

const deleteShelters = protectedWithPermissionsProcedure()
	.input(z.object({ id: z.uuid() }))
	.output(z.boolean())
	.handler(async ({ input, context }) => {
		const shelter = await ShelterService.getById(input.id)

		if (!shelter) {
			throw new ORPCError('NOT_FOUND')
		}

		if (!context.permix?.check('shelters', 'delete', shelter)) {
			throw new ORPCError('FORBIDDEN')
		}
		return await ShelterService.delete(input.id)
	})

export const shelters = {
	list: listShelters,
	get: getShelters,
	create: createShelters,
	update: updateShelters,
	delete: deleteShelters,
}
