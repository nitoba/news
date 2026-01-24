import { Result } from 'better-result'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DatabaseError } from '@/lib/errors'
import { AnimalService } from './animal-service'

// Mock the db module
vi.mock('src/db', () => ({
	db: {
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn(() => ({
					limit: vi.fn(() => ({
						offset: vi.fn(() => ({
							orderBy: vi.fn(),
						})),
					})),
				})),
			})),
		})),
	},
}))

// Mock the animals schema
vi.mock('src/db/schemas', () => ({
	animals: {
		id: 'animals.id',
		name: 'animals.name',
		type: 'animals.type',
		breed: 'animals.breed',
		age: 'animals.age',
		size: 'animals.size',
		gender: 'animals.gender',
		isAdopted: 'animals.isAdopted',
		createdAt: 'animals.createdAt',
		shelterId: 'animals.shelterId',
		userId: 'animals.userId',
		color: 'animals.color',
		description: 'animals.description',
		healthInfo: 'animals.healthInfo',
		imageUrl: 'animals.imageUrl',
		updatedAt: 'animals.updatedAt',
	},
}))

const mockDb = await vi.importMock('src/db')

const mockAnimals = [
	{
		id: '1',
		name: 'Buddy',
		type: 'dog',
		breed: 'Golden Retriever',
		age: 24,
		size: 'big',
		gender: 'male',
		color: 'Golden',
		description: 'Friendly dog',
		healthInfo: 'Healthy',
		isAdopted: false,
		imageUrl: 'http://example.com/buddy.jpg',
		shelterId: 'shelter1',
		userId: null,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01'),
	},
	{
		id: '2',
		name: 'Whiskers',
		type: 'cat',
		breed: 'Siamese',
		age: 12,
		size: 'small',
		gender: 'female',
		color: 'Cream',
		description: 'Sweet cat',
		healthInfo: 'Spayed',
		isAdopted: false,
		imageUrl: 'http://example.com/whiskers.jpg',
		shelterId: 'shelter1',
		userId: null,
		createdAt: new Date('2024-01-02'),
		updatedAt: new Date('2024-01-02'),
	},
	{
		id: '3',
		name: 'Max',
		type: 'dog',
		breed: 'Bulldog',
		age: 36,
		size: 'medium',
		gender: 'male',
		color: 'Brown',
		description: 'Playful dog',
		healthInfo: 'Healthy',
		isAdopted: false,
		imageUrl: 'http://example.com/max.jpg',
		shelterId: 'shelter2',
		userId: null,
		createdAt: new Date('2024-01-03'),
		updatedAt: new Date('2024-01-03'),
	},
	{
		id: '4',
		name: 'Adopted Dog',
		type: 'dog',
		breed: 'Poodle',
		age: 18,
		size: 'small',
		gender: 'female',
		color: 'White',
		description: 'Already adopted',
		healthInfo: 'Healthy',
		isAdopted: true, // This animal should NOT be returned by getPublic
		imageUrl: 'http://example.com/adopted.jpg',
		shelterId: 'shelter1',
		userId: null,
		createdAt: new Date('2024-01-04'),
		updatedAt: new Date('2024-01-04'),
	},
] as const

describe('AnimalService.getPublic', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('returns only non-adopted animals', () => {
		it('should return only animals with isAdopted=false', async () => {
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(mockAnimals.slice(0, 3)),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			const result = await AnimalService.getPublic()

			expect(Result.isOk(result)).toBe(true)
			if (Result.isOk(result)) {
				expect(result.value).toHaveLength(3)
				expect(result.value.every((a) => a.isAdopted === false)).toBe(true)
			}
		})

		it('should always apply isAdopted=false filter', async () => {
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(mockAnimals.slice(0, 3)),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			await AnimalService.getPublic()

			// Verify that where was called with the isAdopted=false condition
			expect(chain.where).toHaveBeenCalled()
		})
	})

	describe('filters by type', () => {
		it('should filter by type=dog', async () => {
			const dogs = mockAnimals.filter((a) => a.type === 'dog' && !a.isAdopted)
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(dogs),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			const result = await AnimalService.getPublic({ type: 'dog' })

			expect(Result.isOk(result)).toBe(true)
			if (Result.isOk(result)) {
				expect(result.value.every((a) => a.type === 'dog')).toBe(true)
			}
		})

		it('should filter by type=cat', async () => {
			const cats = mockAnimals.filter((a) => a.type === 'cat' && !a.isAdopted)
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(cats),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			const result = await AnimalService.getPublic({ type: 'cat' })

			expect(Result.isOk(result)).toBe(true)
			if (Result.isOk(result)) {
				expect(result.value.every((a) => a.type === 'cat')).toBe(true)
			}
		})

		it('should filter by type=other', async () => {
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue([]),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			const result = await AnimalService.getPublic({ type: 'other' })

			expect(Result.isOk(result)).toBe(true)
			if (Result.isOk(result)) {
				expect(result.value).toEqual([])
			}
		})
	})

	describe('filters by size', () => {
		it('should filter by size=small', async () => {
			const smallAnimals = mockAnimals.filter(
				(a) => a.size === 'small' && !a.isAdopted,
			)
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(smallAnimals),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			const result = await AnimalService.getPublic({ size: 'small' })

			expect(Result.isOk(result)).toBe(true)
			if (Result.isOk(result)) {
				expect(result.value.every((a) => a.size === 'small')).toBe(true)
			}
		})

		it('should filter by size=medium', async () => {
			const mediumAnimals = mockAnimals.filter(
				(a) => a.size === 'medium' && !a.isAdopted,
			)
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(mediumAnimals),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			const result = await AnimalService.getPublic({ size: 'medium' })

			expect(Result.isOk(result)).toBe(true)
			if (Result.isOk(result)) {
				expect(result.value.every((a) => a.size === 'medium')).toBe(true)
			}
		})

		it('should filter by size=big', async () => {
			const bigAnimals = mockAnimals.filter(
				(a) => a.size === 'big' && !a.isAdopted,
			)
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(bigAnimals),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			const result = await AnimalService.getPublic({ size: 'big' })

			expect(Result.isOk(result)).toBe(true)
			if (Result.isOk(result)) {
				expect(result.value.every((a) => a.size === 'big')).toBe(true)
			}
		})
	})

	describe('filters by gender', () => {
		it('should filter by gender=male', async () => {
			const maleAnimals = mockAnimals.filter(
				(a) => a.gender === 'male' && !a.isAdopted,
			)
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(maleAnimals),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			const result = await AnimalService.getPublic({ gender: 'male' })

			expect(Result.isOk(result)).toBe(true)
			if (Result.isOk(result)) {
				expect(result.value.every((a) => a.gender === 'male')).toBe(true)
			}
		})

		it('should filter by gender=female', async () => {
			const femaleAnimals = mockAnimals.filter(
				(a) => a.gender === 'female' && !a.isAdopted,
			)
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(femaleAnimals),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			const result = await AnimalService.getPublic({ gender: 'female' })

			expect(Result.isOk(result)).toBe(true)
			if (Result.isOk(result)) {
				expect(result.value.every((a) => a.gender === 'female')).toBe(true)
			}
		})
	})

	describe('combines multiple filters', () => {
		it('should combine type and size filters', async () => {
			const smallDogs = mockAnimals.filter(
				(a) => a.type === 'dog' && a.size === 'small' && !a.isAdopted,
			)
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(smallDogs),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			const result = await AnimalService.getPublic({
				type: 'dog',
				size: 'small',
			})

			expect(Result.isOk(result)).toBe(true)
			if (Result.isOk(result)) {
				expect(
					result.value.every((a) => a.type === 'dog' && a.size === 'small'),
				).toBe(true)
			}
		})

		it('should combine all three filters (type, size, gender)', async () => {
			const smallFemaleDogs = mockAnimals.filter(
				(a) =>
					a.type === 'dog' &&
					a.size === 'small' &&
					a.gender === 'female' &&
					!a.isAdopted,
			)
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(smallFemaleDogs),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			const result = await AnimalService.getPublic({
				type: 'dog',
				size: 'small',
				gender: 'female',
			})

			expect(Result.isOk(result)).toBe(true)
			if (Result.isOk(result)) {
				expect(
					result.value.every(
						(a) =>
							a.type === 'dog' && a.size === 'small' && a.gender === 'female',
					),
				).toBe(true)
			}
		})
	})

	describe('applies pagination', () => {
		it('should use default page=1 and pageSize=10', async () => {
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue([]),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			await AnimalService.getPublic()

			expect(chain.limit).toHaveBeenCalledWith(10)
			expect(chain.offset).toHaveBeenCalledWith(0)
		})

		it('should apply custom page and pageSize', async () => {
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue([]),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			await AnimalService.getPublic({ page: 2, pageSize: 5 })

			expect(chain.limit).toHaveBeenCalledWith(5)
			expect(chain.offset).toHaveBeenCalledWith(5)
		})

		it('should calculate offset correctly for page 3 with pageSize 20', async () => {
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue([]),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			await AnimalService.getPublic({ page: 3, pageSize: 20 })

			expect(chain.limit).toHaveBeenCalledWith(20)
			expect(chain.offset).toHaveBeenCalledWith(40)
		})
	})

	describe('applies sorting', () => {
		it('should use default orderBy=createdAt and orderDirection=desc', async () => {
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue([]),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			await AnimalService.getPublic()

			expect(chain.orderBy).toHaveBeenCalled()
		})

		it('should apply custom orderBy and orderDirection', async () => {
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue([]),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			await AnimalService.getPublic({ orderBy: 'name', orderDirection: 'asc' })

			expect(chain.orderBy).toHaveBeenCalled()
		})

		it('should apply orderBy=id with desc direction', async () => {
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue([]),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			await AnimalService.getPublic({ orderBy: 'id', orderDirection: 'desc' })

			expect(chain.orderBy).toHaveBeenCalled()
		})
	})

	describe('error handling', () => {
		it('should return DatabaseError on database failure', async () => {
			const dbError = new Error('Database connection failed')

			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockRejectedValue(dbError),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			const result = await AnimalService.getPublic()

			expect(Result.isError(result)).toBe(true)
			if (Result.isError(result)) {
				expect(result.error).toBeInstanceOf(DatabaseError)
				expect(result.error.operation).toBe('getPublic')
			}
		})

		it('should include original error in DatabaseError cause', async () => {
			const originalError = new Error('Connection lost')
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockRejectedValue(originalError),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			const result = await AnimalService.getPublic()

			expect(Result.isError(result)).toBe(true)
			if (Result.isError(result)) {
				expect(result.error.cause).toBe(originalError)
			}
		})
	})

	describe('edge cases', () => {
		it('should return empty array when no animals match filters', async () => {
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue([]),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			const result = await AnimalService.getPublic({ type: 'other' })

			expect(Result.isOk(result)).toBe(true)
			if (Result.isOk(result)) {
				expect(result.value).toEqual([])
			}
		})

		it('should handle empty params object', async () => {
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(mockAnimals.slice(0, 3)),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			const result = await AnimalService.getPublic({})

			expect(Result.isOk(result)).toBe(true)
		})

		it('should handle undefined params', async () => {
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(mockAnimals.slice(0, 3)),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			const result = await AnimalService.getPublic(undefined)

			expect(Result.isOk(result)).toBe(true)
		})

		it('should apply all filters together with pagination and sorting', async () => {
			const chain = {
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue([]),
			}

			mockDb.db.select.mockReturnValue({
				from: vi.fn().mockReturnValue(chain),
			})

			await AnimalService.getPublic({
				type: 'dog',
				size: 'small',
				gender: 'female',
				page: 2,
				pageSize: 5,
				orderBy: 'name',
				orderDirection: 'asc',
			})

			expect(chain.where).toHaveBeenCalled()
			expect(chain.limit).toHaveBeenCalledWith(5)
			expect(chain.offset).toHaveBeenCalledWith(5)
			expect(chain.orderBy).toHaveBeenCalled()
		})
	})
})
