/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */

import { asc, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from 'src/db'
import { shelters } from 'src/db/schemas'
import type { QueryParams } from './types/query-params'

type SelectShelters = typeof shelters.$inferSelect
type InsertShelters = typeof shelters.$inferInsert
type UpdateShelters = Partial<Omit<typeof shelters.$inferInsert, 'id'>>

type GetAllParams = QueryParams & {
	city?: string
	state?: string
}

export class ShelterService {
	static async getAll(params?: GetAllParams): Promise<SelectShelters[]> {
		const {
			page = 1,
			pageSize = 10,
			orderBy = 'createdAt',
			orderDirection = 'desc',
			search,
			city,
			state,
		} = params ?? {}

		const conditions: Array<ReturnType<typeof eq | typeof ilike>> = []

		if (search) {
			conditions.push(
				ilike(shelters.name, `%${search}%`),
				ilike(shelters.email, `%${search}%`),
				ilike(shelters.phone, `%${search}%`),
				ilike(shelters.description, `%${search}%`),
				ilike(shelters.address, `%${search}%`),
			)
		}

		if (city) {
			conditions.push(eq(shelters.city, city))
		}

		if (state) {
			conditions.push(eq(shelters.state, state))
		}

		const availableOrderCols = {
			id: shelters.id,
			name: shelters.name,
			createdAt: shelters.createdAt,
		} as const

		const orderCol =
			availableOrderCols[orderBy as keyof typeof availableOrderCols]

		const rows = await db
			.select()
			.from(shelters)
			.where(conditions.length > 0 ? or(...conditions) : undefined)
			.limit(pageSize)
			.offset((page - 1) * pageSize)
			.orderBy(orderDirection === 'desc' ? desc(orderCol) : asc(orderCol))

		return rows
	}
	static async getById(id: string): Promise<SelectShelters | null> {
		const rows = await db
			.select()
			.from(shelters)
			.where(eq(shelters.id, id))
			.limit(1)
		return rows[0] ?? null
	}
	static async create(input: InsertShelters): Promise<SelectShelters> {
		const rows = await db.insert(shelters).values(input).returning()
		return rows[0]
	}
	static async update(
		id: string,
		data: UpdateShelters,
	): Promise<SelectShelters> {
		const rows = await db
			.update(shelters)
			.set(data)
			.where(eq(shelters.id, id))
			.returning()
		return rows[0]
	}
	static async delete(id: string): Promise<boolean> {
		await db.delete(shelters).where(eq(shelters.id, id))
		return true
	}
}
