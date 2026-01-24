/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */
import { Result } from 'better-result'
import { asc, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from 'src/db'
import { adoptionRequests } from 'src/db/schemas'
import { DatabaseError } from '@/lib/errors'
import type { QueryParams } from './types/query-params'

type SelectAdoptionRequests = typeof adoptionRequests.$inferSelect
type InsertAdoptionRequests = typeof adoptionRequests.$inferInsert
type UpdateAdoptionRequests = Partial<
	Omit<typeof adoptionRequests.$inferInsert, 'id'>
>

type GetAllParams = QueryParams & {
	status?: 'pending' | 'approved' | 'rejected' | 'completed'
	userId?: string
	animalId?: string
}

export class AdoptionRequestService {
	static async getAll(
		params?: GetAllParams,
	): Promise<Result<SelectAdoptionRequests[], DatabaseError>> {
		const {
			page = 1,
			pageSize = 10,
			orderBy = 'requestedAt',
			orderDirection = 'desc',
			search,
			status,
			userId,
			animalId,
		} = params ?? {}

		const conditions: Array<ReturnType<typeof eq | typeof ilike>> = []

		if (search) {
			conditions.push(
				ilike(adoptionRequests.message, `%${search}%`),
				ilike(adoptionRequests.feedback, `%${search}%`),
				ilike(adoptionRequests.houseType, `%${search}%`),
			)
		}

		if (status) {
			conditions.push(eq(adoptionRequests.status, status))
		}

		if (userId) {
			conditions.push(eq(adoptionRequests.userId, userId))
		}

		if (animalId) {
			conditions.push(eq(adoptionRequests.animalId, animalId))
		}

		const availableOrderCols = {
			id: adoptionRequests.id,
			userId: adoptionRequests.userId,
			animalId: adoptionRequests.animalId,
			status: adoptionRequests.status,
			respondedAt: adoptionRequests.respondedAt,
			completedAt: adoptionRequests.completedAt,
		} as const

		const orderCol =
			availableOrderCols[orderBy as keyof typeof availableOrderCols]

		return Result.tryPromise({
			try: () =>
				db
					.select()
					.from(adoptionRequests)
					.where(conditions.length > 0 ? or(...conditions) : undefined)
					.limit(pageSize)
					.offset((page - 1) * pageSize)
					.orderBy(orderDirection === 'desc' ? desc(orderCol) : asc(orderCol)),
			catch: (e) => new DatabaseError({ operation: 'getAll', cause: e }),
		})
	}
	static async getById(
		id: string,
	): Promise<Result<SelectAdoptionRequests | null, DatabaseError>> {
		const result = await Result.tryPromise({
			try: () =>
				db
					.select()
					.from(adoptionRequests)
					.where(eq(adoptionRequests.id, id))
					.limit(1),
			catch: (e) => new DatabaseError({ operation: 'getById', cause: e }),
		})

		if (Result.isError(result)) {
			return result
		}

		return Result.ok(result.value[0] ?? null)
	}
	static async create(
		input: InsertAdoptionRequests,
	): Promise<Result<SelectAdoptionRequests, DatabaseError>> {
		const result = await Result.tryPromise({
			try: () => db.insert(adoptionRequests).values(input).returning(),
			catch: (e) => new DatabaseError({ operation: 'create', cause: e }),
		})
		if (Result.isError(result)) {
			return result
		}
		return Result.ok(result.value[0])
	}
	static async update(
		id: string,
		data: UpdateAdoptionRequests,
	): Promise<Result<SelectAdoptionRequests, DatabaseError>> {
		const result = await Result.tryPromise({
			try: () =>
				db
					.update(adoptionRequests)
					.set(data)
					.where(eq(adoptionRequests.id, id))
					.returning(),
			catch: (e) => new DatabaseError({ operation: 'update', cause: e }),
		})
		if (Result.isError(result)) {
			return result
		}
		return Result.ok(result.value[0])
	}
	static async delete(id: string): Promise<Result<boolean, DatabaseError>> {
		const result = await Result.tryPromise({
			try: () => db.delete(adoptionRequests).where(eq(adoptionRequests.id, id)),
			catch: (e) => new DatabaseError({ operation: 'delete', cause: e }),
		})
		if (Result.isError(result)) {
			return result
		}
		return Result.ok(true)
	}
}
