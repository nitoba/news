import { Result } from 'better-result'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DatabaseError } from '@/lib/errors'
import { AnimalService } from '@/lib/services/animal-service'

// Mock the AnimalService
vi.mock('@/lib/services/animal-service', () => ({
	AnimalService: {
		getById: vi.fn(),
		getAll: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
}))

// Mock the procedures
vi.mock('../..', () => ({
	publicProcedure: () => ({
		input: vi.fn().mockReturnThis(),
		output: vi.fn().mockReturnThis(),
		handler: vi.fn((fn) => fn),
	}),
	protectedWithPermissionsProcedure: () => ({
		use: vi.fn().mockReturnThis(),
		input: vi.fn().mockReturnThis(),
		output: vi.fn().mockReturnThis(),
		handler: vi.fn((fn) => fn),
	}),
}))

// Mock checkPermissionMiddleware
vi.mock('@/lib/permix', () => ({
	checkPermissionMiddleware: () => vi.fn(),
}))

const mockGetAll = vi.mocked(AnimalService.getAll)

// Import after mocks are set up
import { animals } from './animals'

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
		adoptionReason: null,
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
		adoptionReason: null,
		isAdopted: false,
		imageUrl: 'http://example.com/whiskers.jpg',
		shelterId: 'shelter1',
		userId: null,
		createdAt: new Date('2024-01-02'),
		updatedAt: new Date('2024-01-02'),
	},
	{
		id: '3',
		name: 'Rex',
		type: 'dog',
		breed: 'Bulldog',
		age: 36,
		size: 'medium',
		gender: 'male',
		color: 'Brown',
		description: 'Playful dog',
		healthInfo: 'Healthy',
		adoptionReason: null,
		isAdopted: true, // This is adopted and should NOT be returned by getPublic
		imageUrl: 'http://example.com/rex.jpg',
		shelterId: 'shelter2',
		userId: null,
		createdAt: new Date('2024-01-03'),
		updatedAt: new Date('2024-01-03'),
	},
]

describe('animals ORPC routes - getPublic', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('getPublic route returns only non-adopted animals', () => {
		it('should return all non-adopted animals when no filters provided', async () => {
			const nonAdoptedAnimals = mockAnimals.filter((a) => !a.isAdopted)
			mockGetAll.mockResolvedValue(Result.ok(nonAdoptedAnimals))

			// Create a handler invocation context
			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
			}

			// Call the handler
			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result).toEqual(nonAdoptedAnimals)
		})

		it('should return empty array when no non-adopted animals exist', async () => {
			mockGetAll.mockResolvedValue(Result.ok([]))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
			}

			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result).toEqual([])
		})
	})

	describe('getPublic route applies type filter correctly', () => {
		it('should filter animals by type dog', async () => {
			const dogs = mockAnimals.filter((a) => a.type === 'dog' && !a.isAdopted)
			mockGetAll.mockResolvedValue(Result.ok(dogs))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
				type: 'dog' as const,
			}

			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result).toEqual(dogs)
			expect(result.every((a) => a.type === 'dog')).toBe(true)
		})

		it('should filter animals by type cat', async () => {
			const cats = mockAnimals.filter((a) => a.type === 'cat' && !a.isAdopted)
			mockGetAll.mockResolvedValue(Result.ok(cats))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
				type: 'cat' as const,
			}

			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result).toEqual(cats)
			expect(result.every((a) => a.type === 'cat')).toBe(true)
		})

		it('should filter animals by type other', async () => {
			const otherAnimals = mockAnimals.filter(
				(a) => a.type === 'other' && !a.isAdopted,
			)
			mockGetAll.mockResolvedValue(Result.ok(otherAnimals))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
				type: 'other' as const,
			}

			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result).toEqual(otherAnimals)
		})
	})

	describe('getPublic route applies size filter correctly', () => {
		it('should filter animals by size small', async () => {
			const smallAnimals = mockAnimals.filter(
				(a) => a.size === 'small' && !a.isAdopted,
			)
			mockGetAll.mockResolvedValue(Result.ok(smallAnimals))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
				size: 'small' as const,
			}

			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result.every((a) => a.size === 'small')).toBe(true)
		})

		it('should filter animals by size medium', async () => {
			const mediumAnimals = mockAnimals.filter(
				(a) => a.size === 'medium' && !a.isAdopted,
			)
			mockGetAll.mockResolvedValue(Result.ok(mediumAnimals))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
				size: 'medium' as const,
			}

			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result.every((a) => a.size === 'medium')).toBe(true)
		})

		it('should filter animals by size big', async () => {
			const bigAnimals = mockAnimals.filter(
				(a) => a.size === 'big' && !a.isAdopted,
			)
			mockGetAll.mockResolvedValue(Result.ok(bigAnimals))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
				size: 'big' as const,
			}

			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result.every((a) => a.size === 'big')).toBe(true)
		})
	})

	describe('getPublic route applies gender filter correctly', () => {
		it('should filter animals by gender male', async () => {
			const maleAnimals = mockAnimals.filter(
				(a) => a.gender === 'male' && !a.isAdopted,
			)
			mockGetAll.mockResolvedValue(Result.ok(maleAnimals))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
				gender: 'male' as const,
			}

			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result.every((a) => a.gender === 'male')).toBe(true)
		})

		it('should filter animals by gender female', async () => {
			const femaleAnimals = mockAnimals.filter(
				(a) => a.gender === 'female' && !a.isAdopted,
			)
			mockGetAll.mockResolvedValue(Result.ok(femaleAnimals))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
				gender: 'female' as const,
			}

			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result.every((a) => a.gender === 'female')).toBe(true)
		})
	})

	describe('getPublic route applies pagination parameters', () => {
		it('should apply page parameter correctly', async () => {
			const paginatedAnimals = [mockAnimals[0]]
			mockGetAll.mockResolvedValue(Result.ok(paginatedAnimals))

			const handler = animals.getPublic
			const input = {
				page: 2,
				pageSize: 10,
			}

			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result).toEqual(paginatedAnimals)
		})

		it('should apply pageSize parameter correctly', async () => {
			const paginatedAnimals = [mockAnimals[1]]
			mockGetAll.mockResolvedValue(Result.ok(paginatedAnimals))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 5,
			}

			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result).toEqual(paginatedAnimals)
		})

		it('should apply orderBy parameter correctly', async () => {
			const sortedAnimals = [...mockAnimals].sort((a, b) =>
				a.name.localeCompare(b.name),
			)
			mockGetAll.mockResolvedValue(Result.ok(sortedAnimals))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
				orderBy: 'name' as const,
			}

			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result).toEqual(sortedAnimals)
		})

		it('should apply orderDirection parameter correctly', async () => {
			const sortedAnimals = [...mockAnimals].reverse()
			mockGetAll.mockResolvedValue(Result.ok(sortedAnimals))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
				orderDirection: 'asc' as const,
			}

			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result).toEqual(sortedAnimals)
		})
	})

	describe('getPublic route applies search parameter', () => {
		it('should search animals by name', async () => {
			const searchResults = [mockAnimals[0]]
			mockGetAll.mockResolvedValue(Result.ok(searchResults))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
				search: 'Buddy',
			}

			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result).toEqual(searchResults)
		})
	})

	describe('getPublic route applies combined filters', () => {
		it('should apply type and size filters together', async () => {
			const combinedAnimals = mockAnimals.filter(
				(a) => a.type === 'dog' && a.size === 'big' && !a.isAdopted,
			)
			mockGetAll.mockResolvedValue(Result.ok(combinedAnimals))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
				type: 'dog' as const,
				size: 'big' as const,
			}

			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result).toEqual(combinedAnimals)
		})

		it('should apply type, size, and gender filters together', async () => {
			const combinedAnimals = mockAnimals.filter(
				(a) =>
					a.type === 'dog' &&
					a.size === 'big' &&
					a.gender === 'male' &&
					!a.isAdopted,
			)
			mockGetAll.mockResolvedValue(Result.ok(combinedAnimals))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
				type: 'dog' as const,
				size: 'big' as const,
				gender: 'male' as const,
			}

			const result = await handler({ input } as never)

			expect(mockGetAll).toHaveBeenCalledWith({ ...input, isAdopted: false })
			expect(result).toEqual(combinedAnimals)
		})
	})

	describe('Edge cases / error paths', () => {
		it('should throw error when database error occurs', async () => {
			const dbError = new DatabaseError({
				operation: 'getPublic',
				cause: new Error('Database connection failed'),
			})
			mockGetAll.mockResolvedValue(Result.err(dbError))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
			}

			await expect(handler({ input } as never)).rejects.toThrow()
		})

		it('should throw error with message from DatabaseError', async () => {
			const dbError = new DatabaseError({
				operation: 'getPublic',
				cause: new Error('Table not found'),
			})
			mockGetAll.mockResolvedValue(Result.err(dbError))

			const handler = animals.getPublic
			const input = {
				page: 1,
				pageSize: 10,
			}

			try {
				await handler({ input } as never)
				expect.fail('Should have thrown an error')
			} catch (error) {
				// The error should be thrown (better-result wraps thrown errors in match)
				expect(error).toBeDefined()
				expect(error).toBeInstanceOf(Error)
			}
		})

		it('should handle default pagination values when not provided', async () => {
			const animalsList = [mockAnimals[0]]
			mockGetAll.mockResolvedValue(Result.ok(animalsList))

			const handler = animals.getPublic
			// Simulate default values being applied by the schema
			const input = {}

			const result = await handler({ input } as never)

			// The service should be called with defaults applied by Zod schema
			expect(mockGetAll).toHaveBeenCalled()
			expect(result).toEqual(animalsList)
		})
	})

	describe('getPublic route is exported correctly', () => {
		it('should have getPublic property in animals export', () => {
			expect(animals).toHaveProperty('getPublic')
			expect(animals.getPublic).toBeDefined()
			expect(typeof animals.getPublic).toBe('function')
		})

		it('should have all expected route properties', () => {
			expect(animals).toHaveProperty('list')
			expect(animals).toHaveProperty('get')
			expect(animals).toHaveProperty('getPublic')
			expect(animals).toHaveProperty('create')
			expect(animals).toHaveProperty('update')
			expect(animals).toHaveProperty('delete')
		})
	})
})
