import { Result } from 'better-result'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { shelterManagers } from '@/db/schemas'
import { DatabaseError } from '@/lib/errors'

async function getUserManagedShelterIds(
	userId: string,
): Promise<Result<string[], DatabaseError>> {
	const result = await Result.tryPromise({
		try: () =>
			db
				.select({ shelterId: shelterManagers.shelterId })
				.from(shelterManagers)
				.where(eq(shelterManagers.userId, userId)),
		catch: (e) =>
			new DatabaseError({ operation: 'getUserManagedShelterIds', cause: e }),
	})

	if (Result.isError(result)) {
		return result
	}

	return Result.ok(result.value.map((r) => r.shelterId))
}

async function addShelterManager(
	shelterId: string,
	userId: string,
): Promise<Result<void, DatabaseError>> {
	return (
		await Result.tryPromise({
			try: () => db.insert(shelterManagers).values({ shelterId, userId }),
			catch: (e) =>
				new DatabaseError({ operation: 'addShelterManager', cause: e }),
		})
	).map(() => undefined)
}

async function removeShelterManager(
	shelterId: string,
	userId: string,
): Promise<Result<void, DatabaseError>> {
	return (
		await Result.tryPromise({
			try: () =>
				db
					.delete(shelterManagers)
					.where(
						and(
							eq(shelterManagers.shelterId, shelterId),
							eq(shelterManagers.userId, userId),
						),
					),
			catch: (e) =>
				new DatabaseError({ operation: 'removeShelterManager', cause: e }),
		})
	).map(() => undefined)
}

export const shelterManagerService = {
	getUserManagedShelterIds,
	addShelterManager,
	removeShelterManager,
}
