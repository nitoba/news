/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */
import { Result } from 'better-result'
import { asc, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from 'src/db'
import { shelters } from 'src/db/schemas'
import { DatabaseError } from '@/lib/errors'
import type { QueryParams } from './types/query-params'

type SelectShelters = typeof shelters.$inferSelect
type InsertShelters = typeof shelters.$inferInsert
type UpdateShelters = Partial<Omit<typeof shelters.$inferInsert, 'id'>>

type GetAllParams = QueryParams & {
	city?: string
	state?: string
}

export class ShelterService {
	static async getAll(
		params?: GetAllParams,
	): Promise<Result<SelectShelters[], DatabaseError>> {
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

		return Result.tryPromise({
			try: () =>
				db
					.select()
					.from(shelters)
					.where(conditions.length > 0 ? or(...conditions) : undefined)
					.limit(pageSize)
					.offset((page - 1) * pageSize)
					.orderBy(orderDirection === 'desc' ? desc(orderCol) : asc(orderCol)),
			catch: (e) => new DatabaseError({ operation: 'getAll', cause: e }),
		})
	}
	static async getById(
		id: string,
	): Promise<Result<SelectShelters | null, DatabaseError>> {
		const result = await Result.tryPromise({
			try: () => db.select().from(shelters).where(eq(shelters.id, id)).limit(1),
			catch: (e) => new DatabaseError({ operation: 'getById', cause: e }),
		})

		if (Result.isError(result)) {
			return result
		}

		return Result.ok(result.value[0] ?? null)
	}
	static async create(
		input: InsertShelters,
	): Promise<Result<SelectShelters, DatabaseError>> {
		const result = await Result.tryPromise({
			try: () => db.insert(shelters).values(input).returning(),
			catch: (e) => new DatabaseError({ operation: 'create', cause: e }),
		})
		if (Result.isError(result)) {
			return result
		}
		return Result.ok(result.value[0])
	}
	static async update(
		id: string,
		data: UpdateShelters,
	): Promise<Result<SelectShelters, DatabaseError>> {
		const result = await Result.tryPromise({
			try: () =>
				db.update(shelters).set(data).where(eq(shelters.id, id)).returning(),
			catch: (e) => new DatabaseError({ operation: 'update', cause: e }),
		})
		if (Result.isError(result)) {
			return result
		}
		return Result.ok(result.value[0])
	}
	static async delete(id: string): Promise<Result<boolean, DatabaseError>> {
		const result = await Result.tryPromise({
			try: () => db.delete(shelters).where(eq(shelters.id, id)),
			catch: (e) => new DatabaseError({ operation: 'delete', cause: e }),
		})
		if (Result.isError(result)) {
			return result
		}
		return Result.ok(true)
	}
}
