import { z } from 'zod'
import { paginationSchema } from './query-params.zod'

export const InsertAnimalsSchema = z.object({
	shelterId: z.string().nullable().optional(),
	userId: z.string().nullable().optional(),
	name: z.string(),
	type: z.enum(['dog', 'cat', 'other'] as const),
	breed: z.string().nullable().optional(),
	age: z.number().int().nullable().optional(),
	size: z.enum(['small', 'medium', 'big'] as const),
	gender: z.enum(['male', 'female'] as const),
	color: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	healthInfo: z.string().nullable().optional(),
	adoptionReason: z.string().nullable().optional(),
	isAdopted: z.boolean().optional(),
	imageUrl: z.string().nullable().optional(),
	createdAt: z.coerce.date().optional(),
	updatedAt: z.coerce.date().optional(),
})

export const UpdateAnimalsSchema = z.object({
	shelterId: z.string().nullable().optional(),
	userId: z.string().nullable().optional(),
	name: z.string().optional(),
	type: z.enum(['dog', 'cat', 'other'] as const).optional(),
	breed: z.string().nullable().optional(),
	age: z.number().int().nullable().optional(),
	size: z.enum(['small', 'medium', 'big'] as const).optional(),
	gender: z.enum(['male', 'female'] as const).optional(),
	color: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	healthInfo: z.string().nullable().optional(),
	adoptionReason: z.string().nullable().optional(),
	isAdopted: z.boolean().optional(),
	imageUrl: z.string().nullable().optional(),
	createdAt: z.coerce.date().optional(),
	updatedAt: z.coerce.date().optional(),
})

export const SelectAnimalsSchema = z.object({
	id: z.string(),
	shelterId: z.string().nullable(),
	userId: z.string().nullable(),
	name: z.string(),
	type: z.enum(['dog', 'cat', 'other'] as const),
	breed: z.string().nullable(),
	age: z.number().int().nullable(),
	size: z.enum(['small', 'medium', 'big'] as const),
	gender: z.enum(['male', 'female'] as const),
	color: z.string().nullable(),
	description: z.string().nullable(),
	healthInfo: z.string().nullable(),
	adoptionReason: z.string().nullable(),
	isAdopted: z.boolean(),
	imageUrl: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export const ListAnimalsSchema = z.object({
	...paginationSchema.shape,
	orderBy: z
		.enum([
			'id',
			'name',
			'type',
			'breed',
			'age',
			'size',
			'gender',
			'isAdopted',
			'createdAt',
			'updatedAt',
		] as const)
		.optional(),
	type: z.enum(['dog', 'cat', 'other']).optional(),
	size: z.enum(['small', 'medium', 'big']).optional(),
	gender: z.enum(['male', 'female']).optional(),
	isAdopted: z.boolean().optional(),
	shelterId: z.uuid().optional(),
	userId: z.uuid().optional(),
})

export type InsertAnimalsInput = z.input<typeof InsertAnimalsSchema>
export type UpdateAnimalsInput = z.input<typeof UpdateAnimalsSchema>
export type SelectAnimalsOutput = z.output<typeof SelectAnimalsSchema>

// Public-facing filter schema for animal listing
// Excludes admin-only fields (isAdopted, shelterId, userId, orderBy)
export const PublicAnimalFiltersSchema = z.object({
	type: z.enum(['dog', 'cat', 'other'] as const).optional(),
	size: z.enum(['small', 'medium', 'big'] as const).optional(),
	gender: z.enum(['male', 'female'] as const).optional(),
})

// Public list schema that combines pagination with public filters
export const ListAnimalPublicSchema = z.object({
	...paginationSchema.shape,
	...PublicAnimalFiltersSchema.shape,
})

// TypeScript type exports for public schemas
export type PublicAnimalFiltersInput = z.input<typeof PublicAnimalFiltersSchema>
export type ListAnimalPublicInput = z.input<typeof ListAnimalPublicSchema>
