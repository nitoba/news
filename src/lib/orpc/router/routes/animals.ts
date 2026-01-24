import { ORPCError } from '@orpc/server'
import {
	InsertAnimalsSchema,
	ListAnimalPublicSchema,
	ListAnimalsSchema,
	SelectAnimalsSchema,
	UpdateAnimalsSchema,
} from 'src/lib/validators'
import { z } from 'zod'
import { checkPermissionMiddleware } from '@/lib/permix'
import { AnimalService } from '@/lib/services/animal-service'
import { protectedWithPermissionsProcedure, publicProcedure } from '../..'

const listAnimals = publicProcedure()
	.input(ListAnimalsSchema)
	.output(z.array(SelectAnimalsSchema))
	.handler(async ({ input }) => {
		const result = await AnimalService.getAll(input)

		return result.match({
			ok: (animals) => animals,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})
	})

const getAnimals = publicProcedure()
	.input(z.object({ id: z.uuid() }))
	.output(SelectAnimalsSchema.nullable())
	.handler(async ({ input }) => {
		const result = await AnimalService.getById(input.id)

		return result.match({
			ok: (animal) => animal,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})
	})

const getPublicAnimals = publicProcedure()
	.input(ListAnimalPublicSchema)
	.output(z.array(SelectAnimalsSchema))
	.handler(async ({ input }) => {
		const result = await AnimalService.getAll({ ...input, isAdopted: false })

		return result.match({
			ok: (animals) => animals,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})
	})

const createAnimals = protectedWithPermissionsProcedure()
	.use(checkPermissionMiddleware('animals', 'create'))
	.input(InsertAnimalsSchema)
	.output(SelectAnimalsSchema)
	.handler(async ({ input }) => {
		const result = await AnimalService.create(input)

		return result.match({
			ok: (animal) => animal,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})
	})

const updateAnimals = protectedWithPermissionsProcedure()
	.input(z.object({ id: z.uuid(), data: UpdateAnimalsSchema }))
	.output(SelectAnimalsSchema)
	.handler(async ({ input, context }) => {
		const animalResult = await AnimalService.getById(input.id)

		const animal = animalResult.match({
			ok: (animal) => animal,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})

		if (!animal) {
			throw new ORPCError('NOT_FOUND')
		}

		if (!context.permix?.check('animals', 'update', animal)) {
			throw new ORPCError('FORBIDDEN')
		}

		const result = await AnimalService.update(input.id, input.data)

		return result.match({
			ok: (animal) => animal,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})
	})

const deleteAnimals = protectedWithPermissionsProcedure()
	.input(z.object({ id: z.uuid() }))
	.output(z.boolean())
	.handler(async ({ input, context }) => {
		const animalResult = await AnimalService.getById(input.id)

		const animal = animalResult.match({
			ok: (animal) => animal,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})

		if (!animal) {
			throw new ORPCError('NOT_FOUND')
		}

		if (!context.permix?.check('animals', 'delete', animal)) {
			throw new ORPCError('FORBIDDEN')
		}

		const result = await AnimalService.delete(input.id)

		return result.match({
			ok: (deleted) => deleted,
			err: (error) => {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: error.message,
				})
			},
		})
	})

export const animals = {
	list: listAnimals,
	get: getAnimals,
	getPublic: getPublicAnimals,
	create: createAnimals,
	update: updateAnimals,
	delete: deleteAnimals,
}
