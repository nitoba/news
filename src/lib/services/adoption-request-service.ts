/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */
import { eq } from 'drizzle-orm'
import { db } from 'src/db'
import { adoptionRequests } from 'src/db/schemas'

type SelectAdoptionRequests = typeof adoptionRequests.$inferSelect
type InsertAdoptionRequests = typeof adoptionRequests.$inferInsert
type UpdateAdoptionRequests = Partial<
	Omit<typeof adoptionRequests.$inferInsert, 'id'>
>

export class AdoptionRequestService {
	static async getAll(): Promise<SelectAdoptionRequests[]> {
		const rows = await db.select().from(adoptionRequests)
		return rows
	}
	static async getById(id: string): Promise<SelectAdoptionRequests | null> {
		const rows = await db
			.select()
			.from(adoptionRequests)
			.where(eq(adoptionRequests.id, id))
			.limit(1)
		return rows[0] ?? null
	}
	static async create(
		input: InsertAdoptionRequests,
	): Promise<SelectAdoptionRequests> {
		const rows = await db.insert(adoptionRequests).values(input).returning()
		return rows[0]
	}
	static async update(
		id: string,
		data: UpdateAdoptionRequests,
	): Promise<SelectAdoptionRequests> {
		const rows = await db
			.update(adoptionRequests)
			.set(data)
			.where(eq(adoptionRequests.id, id))
			.returning()
		return rows[0]
	}
	static async delete(id: string): Promise<boolean> {
		await db.delete(adoptionRequests).where(eq(adoptionRequests.id, id))
		return true
	}
}
