/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */
import { Result } from 'better-result'
import { asc, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from 'src/db'
import { animals } from 'src/db/schemas'
import { DatabaseError } from '@/lib/errors'
import type { QueryParams } from './types/query-params'

type SelectAnimals = typeof animals.$inferSelect
type InsertAnimals = typeof animals.$inferInsert
type UpdateAnimals = Partial<Omit<typeof animals.$inferInsert, 'id'>>

type GetAllParams = QueryParams & {
	type?: 'dog' | 'cat' | 'other'
	size?: 'small' | 'medium' | 'big'
	gender?: 'male' | 'female'
	isAdopted?: boolean
	shelterId?: string
	userId?: string
}

type GetPublicParams = QueryParams & {
	type?: 'dog' | 'cat' | 'other'
	size?: 'small' | 'medium' | 'big'
	gender?: 'male' | 'female'
}

export class AnimalService {
	static async getAll(
		params?: GetAllParams,
	): Promise<Result<SelectAnimals[], DatabaseError>> {
		const {
			page = 1,
			pageSize = 10,
			orderBy = 'createdAt',
			orderDirection = 'desc',
			search,
			type,
			size,
			gender,
			isAdopted,
			shelterId,
			userId,
		} = params ?? {}

		const conditions: Array<ReturnType<typeof eq | typeof ilike>> = []

		if (search) {
			conditions.push(
				ilike(animals.name, `%${search}%`),
				ilike(animals.breed, `%${search}%`),
				ilike(animals.description, `%${search}%`),
				ilike(animals.color, `%${search}%`),
				ilike(animals.healthInfo, `%${search}%`),
			)
		}

		if (type) {
			conditions.push(eq(animals.type, type))
		}

		if (size) {
			conditions.push(eq(animals.size, size))
		}

		if (gender) {
			conditions.push(eq(animals.gender, gender))
		}

		if (isAdopted !== undefined) {
			conditions.push(eq(animals.isAdopted, isAdopted))
		}

		if (shelterId) {
			conditions.push(eq(animals.shelterId, shelterId))
		}

		if (userId) {
			conditions.push(eq(animals.userId, userId))
		}

		const availableOrderCols = {
			id: animals.id,
			name: animals.name,
			type: animals.type,
			breed: animals.breed,
			age: animals.age,
			size: animals.size,
			gender: animals.gender,
			isAdopted: animals.isAdopted,
			createdAt: animals.createdAt,
		} as const

		const orderCol =
			availableOrderCols[orderBy as keyof typeof availableOrderCols]

		return Result.tryPromise({
			try: () =>
				db
					.select()
					.from(animals)
					.where(conditions.length > 0 ? or(...conditions) : undefined)
					.limit(pageSize)
					.offset((page - 1) * pageSize)
					.orderBy(orderDirection === 'desc' ? desc(orderCol) : asc(orderCol)),
			catch: (e) => new DatabaseError({ operation: 'getAll', cause: e }),
		})
	}

	static async getPublic(
		params?: GetPublicParams,
	): Promise<Result<SelectAnimals[], DatabaseError>> {
		const {
			page = 1,
			pageSize = 10,
			orderBy = 'createdAt',
			orderDirection = 'desc',
			type,
			size,
			gender,
		} = params ?? {}

		const conditions: Array<ReturnType<typeof eq>> = [
			// Always filter to only show non-adopted animals
			eq(animals.isAdopted, false),
		]

		if (type) {
			conditions.push(eq(animals.type, type))
		}

		if (size) {
			conditions.push(eq(animals.size, size))
		}

		if (gender) {
			conditions.push(eq(animals.gender, gender))
		}

		const availableOrderCols = {
			id: animals.id,
			name: animals.name,
			type: animals.type,
			breed: animals.breed,
			age: animals.age,
			size: animals.size,
			gender: animals.gender,
			isAdopted: animals.isAdopted,
			createdAt: animals.createdAt,
		} as const

		const orderCol =
			availableOrderCols[orderBy as keyof typeof availableOrderCols]

		return Result.tryPromise({
			try: () =>
				db
					.select()
					.from(animals)
					.where(or(...conditions))
					.limit(pageSize)
					.offset((page - 1) * pageSize)
					.orderBy(orderDirection === 'desc' ? desc(orderCol) : asc(orderCol)),
			catch: (e) => new DatabaseError({ operation: 'getPublic', cause: e }),
		})
	}

	static async getById(
		id: string,
	): Promise<Result<SelectAnimals | null, DatabaseError>> {
		const result = await Result.tryPromise({
			try: () => db.select().from(animals).where(eq(animals.id, id)).limit(1),
			catch: (e) => new DatabaseError({ operation: 'getById', cause: e }),
		})

		if (Result.isError(result)) {
			return result
		}

		return Result.ok(result.value[0] ?? null)
	}
	static async create(
		input: InsertAnimals,
	): Promise<Result<SelectAnimals, DatabaseError>> {
		const result = await Result.tryPromise({
			try: () => db.insert(animals).values(input).returning(),
			catch: (e) => new DatabaseError({ operation: 'create', cause: e }),
		})
		if (Result.isError(result)) {
			return result
		}
		return Result.ok(result.value[0])
	}
	static async update(
		id: string,
		data: UpdateAnimals,
	): Promise<Result<SelectAnimals, DatabaseError>> {
		const result = await Result.tryPromise({
			try: () =>
				db.update(animals).set(data).where(eq(animals.id, id)).returning(),
			catch: (e) => new DatabaseError({ operation: 'update', cause: e }),
		})
		if (Result.isError(result)) {
			return result
		}
		return Result.ok(result.value[0])
	}
	static async delete(id: string): Promise<Result<boolean, DatabaseError>> {
		const result = await Result.tryPromise({
			try: () => db.delete(animals).where(eq(animals.id, id)),
			catch: (e) => new DatabaseError({ operation: 'delete', cause: e }),
		})
		if (Result.isError(result)) {
			return result
		}
		return Result.ok(true)
	}
}
