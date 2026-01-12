/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */

import { asc, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from 'src/db'
import { animals } from 'src/db/schemas'
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

export class AnimalService {
	static async getAll(params?: GetAllParams): Promise<SelectAnimals[]> {
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

		const rows = await db
			.select()
			.from(animals)
			.where(conditions.length > 0 ? or(...conditions) : undefined)
			.limit(pageSize)
			.offset((page - 1) * pageSize)
			.orderBy(orderDirection === 'desc' ? desc(orderCol) : asc(orderCol))

		return rows
	}
	static async getById(id: string): Promise<SelectAnimals | null> {
		const rows = await db
			.select()
			.from(animals)
			.where(eq(animals.id, id))
			.limit(1)
		return rows[0] ?? null
	}
	static async create(input: InsertAnimals): Promise<SelectAnimals> {
		const rows = await db.insert(animals).values(input).returning()
		return rows[0]
	}
	static async update(id: string, data: UpdateAnimals): Promise<SelectAnimals> {
		const rows = await db
			.update(animals)
			.set(data)
			.where(eq(animals.id, id))
			.returning()
		return rows[0]
	}
	static async delete(id: string): Promise<boolean> {
		await db.delete(animals).where(eq(animals.id, id))
		return true
	}
}
