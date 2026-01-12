import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { shelterManagers } from '@/db/schemas'

async function getUserManagedShelterIds(userId: string): Promise<string[]> {
	const result = await db
		.select({ shelterId: shelterManagers.shelterId })
		.from(shelterManagers)
		.where(eq(shelterManagers.userId, userId))

	return result.map((r) => r.shelterId)
}

async function addShelterManager(shelterId: string, userId: string) {
	await db.insert(shelterManagers).values({
		shelterId,
		userId,
	})
}

async function removeShelterManager(shelterId: string, userId: string) {
	await db
		.delete(shelterManagers)
		.where(
			and(
				eq(shelterManagers.shelterId, shelterId),
				eq(shelterManagers.userId, userId),
			),
		)
}

export const shelterManagerService = {
	getUserManagedShelterIds,
	addShelterManager,
	removeShelterManager,
}
