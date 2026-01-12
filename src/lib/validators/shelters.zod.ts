import { z } from 'zod'
import { paginationSchema } from './query-params.zod'

export const InsertSheltersSchema = z.object({
	name: z.string(),
	email: z.string(),
	phone: z.string(),
	cnpj: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	address: z.string(),
	city: z.string(),
	state: z.string(),
	zipCode: z.string(),
	website: z.string().nullable().optional(),
	createdAt: z.coerce.date().optional(),
	updatedAt: z.coerce.date().optional(),
})

export const UpdateSheltersSchema = z.object({
	name: z.string().optional(),
	email: z.string().optional(),
	phone: z.string().optional(),
	cnpj: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),
	website: z.string().nullable().optional(),
	createdAt: z.coerce.date().optional(),
	updatedAt: z.coerce.date().optional(),
})

export const SelectSheltersSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	phone: z.string(),
	cnpj: z.string().nullable(),
	description: z.string().nullable(),
	address: z.string(),
	city: z.string(),
	state: z.string(),
	zipCode: z.string(),
	website: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export const ListSheltersSchema = z.object({
	...paginationSchema.shape,
	orderBy: z
		.enum([
			'id',
			'name',
			'email',
			'phone',
			'city',
			'state',
			'zipCode',
			'createdAt',
			'updatedAt',
		] as const)
		.optional(),
	city: z.string().optional(),
	state: z.string().optional(),
})

export type InsertSheltersInput = z.input<typeof InsertSheltersSchema>
export type UpdateSheltersInput = z.input<typeof UpdateSheltersSchema>
export type SelectSheltersOutput = z.output<typeof SelectSheltersSchema>
