import { z } from 'zod'

export const paginationSchema = z.object({
	page: z.number().min(1).optional(),
	pageSize: z.number().min(1).max(100).optional(),
	orderBy: z.string().optional(),
	orderDirection: z.enum(['asc', 'desc']).optional(),
	search: z.string().optional(),
})
