import { z } from 'zod'
import { paginationSchema } from './query-params.zod'

export const InsertAdoptionRequestsSchema = z.object({
	userId: z.string(),
	animalId: z.string(),
	status: z
		.enum(['pending', 'approved', 'rejected', 'completed'] as const)
		.optional(),
	message: z.string().nullable().optional(),
	hasExperience: z.boolean().nullable().optional(),
	hasOtherPets: z.boolean().nullable().optional(),
	hasChildren: z.boolean().nullable().optional(),
	houseType: z.string().nullable().optional(),
	feedback: z.string().nullable().optional(),
	requestedAt: z.coerce.date().optional(),
	respondedAt: z.coerce.date().nullable().optional(),
	completedAt: z.coerce.date().nullable().optional(),
})

export const UpdateAdoptionRequestsSchema = z.object({
	userId: z.string().optional(),
	animalId: z.string().optional(),
	status: z
		.enum(['pending', 'approved', 'rejected', 'completed'] as const)
		.optional(),
	message: z.string().nullable().optional(),
	hasExperience: z.boolean().nullable().optional(),
	hasOtherPets: z.boolean().nullable().optional(),
	hasChildren: z.boolean().nullable().optional(),
	houseType: z.string().nullable().optional(),
	feedback: z.string().nullable().optional(),
	requestedAt: z.coerce.date().optional(),
	respondedAt: z.coerce.date().nullable().optional(),
	completedAt: z.coerce.date().nullable().optional(),
})

export const SelectAdoptionRequestsSchema = z.object({
	id: z.string(),
	userId: z.string(),
	animalId: z.string(),
	status: z.enum(['pending', 'approved', 'rejected', 'completed'] as const),
	message: z.string().nullable(),
	hasExperience: z.boolean().nullable(),
	hasOtherPets: z.boolean().nullable(),
	hasChildren: z.boolean().nullable(),
	houseType: z.string().nullable(),
	feedback: z.string().nullable(),
	requestedAt: z.date(),
	respondedAt: z.date().nullable(),
	completedAt: z.date().nullable(),
})

export const ListAdoptionRequestsSchema = z.object({
	...paginationSchema.shape,
	orderBy: z
		.enum([
			'id',
			'userId',
			'animalId',
			'status',
			'requestedAt',
			'respondedAt',
			'completedAt',
		] as const)
		.optional(),
	status: z
		.enum(['pending', 'approved', 'rejected', 'completed'] as const)
		.optional(),
	userId: z.uuid().optional(),
	animalId: z.uuid().optional(),
})

export type InsertAdoptionRequestsInput = z.input<
	typeof InsertAdoptionRequestsSchema
>
export type UpdateAdoptionRequestsInput = z.input<
	typeof UpdateAdoptionRequestsSchema
>
export type SelectAdoptionRequestsOutput = z.output<
	typeof SelectAdoptionRequestsSchema
>
