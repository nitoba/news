import { ORPCError } from '@orpc/server'
import {
	InsertAdoptionRequestsSchema,
	ListAdoptionRequestsSchema,
	SelectAdoptionRequestsSchema,
	UpdateAdoptionRequestsSchema,
} from 'src/lib/validators'
import { z } from 'zod'
import { checkPermissionMiddleware } from '@/lib/permix'
import { AdoptionRequestService } from '@/lib/services/adoption-request-service'
import { protectedWithPermissionsProcedure, publicProcedure } from '../..'

const listAdoptionRequests = publicProcedure()
	.input(ListAdoptionRequestsSchema)
	.output(z.array(SelectAdoptionRequestsSchema))
	.handler(async ({ input }) => {
		const result = await AdoptionRequestService.getAll(input)

		return result.match({
			ok: (requests) => requests,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})
	})

const getAdoptionRequests = publicProcedure()
	.input(z.object({ id: z.uuid() }))
	.output(SelectAdoptionRequestsSchema.nullable())
	.handler(async ({ input }) => {
		const result = await AdoptionRequestService.getById(input.id)

		return result.match({
			ok: (request) => request,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})
	})

const createAdoptionRequests = protectedWithPermissionsProcedure()
	.use(checkPermissionMiddleware('adoptionRequests', 'create'))
	.input(InsertAdoptionRequestsSchema)
	.output(SelectAdoptionRequestsSchema)
	.handler(async ({ input }) => {
		const result = await AdoptionRequestService.create(input)

		return result.match({
			ok: (request) => request,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})
	})

const updateAdoptionRequests = protectedWithPermissionsProcedure()
	.input(z.object({ id: z.uuid(), data: UpdateAdoptionRequestsSchema }))
	.output(SelectAdoptionRequestsSchema)
	.handler(async ({ input, context }) => {
		const requestResult = await AdoptionRequestService.getById(input.id)

		const request = requestResult.match({
			ok: (request) => request,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})

		if (!request) {
			throw new ORPCError('NOT_FOUND')
		}

		if (!context.permix?.check('adoptionRequests', 'update', request)) {
			throw new ORPCError('FORBIDDEN')
		}

		const result = await AdoptionRequestService.update(input.id, input.data)

		return result.match({
			ok: (request) => request,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})
	})

const deleteAdoptionRequests = protectedWithPermissionsProcedure()
	.input(z.object({ id: z.uuid() }))
	.output(z.boolean())
	.handler(async ({ input, context }) => {
		const requestResult = await AdoptionRequestService.getById(input.id)

		const request = requestResult.match({
			ok: (request) => request,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})

		if (!request) {
			throw new ORPCError('NOT_FOUND')
		}

		if (!context.permix?.check('adoptionRequests', 'delete', request)) {
			throw new ORPCError('FORBIDDEN')
		}

		const result = await AdoptionRequestService.delete(input.id)

		return result.match({
			ok: (deleted) => true,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})
	})

export const adoptionRequests = {
	list: listAdoptionRequests,
	get: getAdoptionRequests,
	create: createAdoptionRequests,
	update: updateAdoptionRequests,
	delete: deleteAdoptionRequests,
}
