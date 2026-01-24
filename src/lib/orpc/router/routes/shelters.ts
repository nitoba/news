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
		const result = await ShelterService.getAll(input)

		return result.match({
			ok: (shelters) => shelters,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})
	})

const getShelters = publicProcedure()
	.input(z.object({ id: z.uuid() }))
	.output(SelectSheltersSchema.nullable())
	.handler(async ({ input }) => {
		const result = await ShelterService.getById(input.id)

		return result.match({
			ok: (shelter) => shelter,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})
	})

const createShelters = protectedWithPermissionsProcedure()
	.use(checkPermissionMiddleware('shelters', 'create'))
	.input(InsertSheltersSchema)
	.output(SelectSheltersSchema)
	.handler(async ({ input }) => {
		const result = await ShelterService.create(input)

		return result.match({
			ok: (shelter) => shelter,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})
	})

const updateShelters = protectedWithPermissionsProcedure()
	.input(z.object({ id: z.uuid(), data: UpdateSheltersSchema }))
	.output(SelectSheltersSchema)
	.handler(async ({ input, context }) => {
		const shelterResult = await ShelterService.getById(input.id)

		const shelter = shelterResult.match({
			ok: (shelter) => shelter,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})

		if (!shelter) {
			throw new ORPCError('NOT_FOUND')
		}

		if (!context.permix?.check('shelters', 'update', shelter)) {
			throw new ORPCError('FORBIDDEN')
		}

		const result = await ShelterService.update(input.id, input.data)

		return result.match({
			ok: (shelter) => shelter,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})
	})

const deleteShelters = protectedWithPermissionsProcedure()
	.input(z.object({ id: z.uuid() }))
	.output(z.boolean())
	.handler(async ({ input, context }) => {
		const shelterResult = await ShelterService.getById(input.id)

		const shelter = shelterResult.match({
			ok: (shelter) => shelter,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})

		if (!shelter) {
			throw new ORPCError('NOT_FOUND')
		}

		if (!context.permix?.check('shelters', 'delete', shelter)) {
			throw new ORPCError('FORBIDDEN')
		}

		const result = await ShelterService.delete(input.id)

		return result.match({
			ok: (deleted) => deleted,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})
	})

export const shelters = {
	list: listShelters,
	get: getShelters,
	create: createShelters,
	update: updateShelters,
	delete: deleteShelters,
}
