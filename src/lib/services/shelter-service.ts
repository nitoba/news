/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */

import { eq } from 'drizzle-orm'
import { db } from 'src/db'
import { shelters } from 'src/db/schemas'

type SelectShelters = typeof shelters.$inferSelect
type InsertShelters = typeof shelters.$inferInsert
type UpdateShelters = Partial<Omit<typeof shelters.$inferInsert, 'id'>>

export class ShelterService {
	static async getAll(): Promise<SelectShelters[]> {
		const rows = await db.select().from(shelters)
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
