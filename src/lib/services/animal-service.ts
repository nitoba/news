/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */

import { eq } from 'drizzle-orm'
import { db } from 'src/db'
import { animals } from 'src/db/schemas'

type SelectAnimals = typeof animals.$inferSelect
type InsertAnimals = typeof animals.$inferInsert
type UpdateAnimals = Partial<Omit<typeof animals.$inferInsert, 'id'>>

export class AnimalService {
	static async getAll(): Promise<SelectAnimals[]> {
		const rows = await db.select().from(animals)
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
