import { describe, expect, it } from 'vitest'
import {
	type ListAnimalPublicInput,
	ListAnimalPublicSchema,
	type PublicAnimalFiltersInput,
	PublicAnimalFiltersSchema,
} from './animals.zod'

describe('PublicAnimalFiltersSchema', () => {
	describe('valid single filters', () => {
		it('should accept type filter with valid value', () => {
			const result = PublicAnimalFiltersSchema.safeParse({ type: 'dog' })
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.type).toBe('dog')
			}
		})

		it('should accept type="cat"', () => {
			const result = PublicAnimalFiltersSchema.safeParse({ type: 'cat' })
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.type).toBe('cat')
			}
		})

		it('should accept type="other"', () => {
			const result = PublicAnimalFiltersSchema.safeParse({ type: 'other' })
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.type).toBe('other')
			}
		})

		it('should accept size filter with valid value', () => {
			const result = PublicAnimalFiltersSchema.safeParse({ size: 'small' })
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.size).toBe('small')
			}
		})

		it('should accept size="medium"', () => {
			const result = PublicAnimalFiltersSchema.safeParse({ size: 'medium' })
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.size).toBe('medium')
			}
		})

		it('should accept size="big"', () => {
			const result = PublicAnimalFiltersSchema.safeParse({ size: 'big' })
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.size).toBe('big')
			}
		})

		it('should accept gender filter with valid value', () => {
			const result = PublicAnimalFiltersSchema.safeParse({ gender: 'male' })
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.gender).toBe('male')
			}
		})

		it('should accept gender="female"', () => {
			const result = PublicAnimalFiltersSchema.safeParse({ gender: 'female' })
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.gender).toBe('female')
			}
		})
	})

	describe('valid combined filters', () => {
		it('should accept type and size filters combined', () => {
			const result = PublicAnimalFiltersSchema.safeParse({
				type: 'dog',
				size: 'small',
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.type).toBe('dog')
				expect(result.data.size).toBe('small')
			}
		})

		it('should accept all three filters combined', () => {
			const result = PublicAnimalFiltersSchema.safeParse({
				type: 'dog',
				size: 'small',
				gender: 'male',
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.type).toBe('dog')
				expect(result.data.size).toBe('small')
				expect(result.data.gender).toBe('male')
			}
		})

		it('should accept type and gender without size', () => {
			const result = PublicAnimalFiltersSchema.safeParse({
				type: 'cat',
				gender: 'female',
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.type).toBe('cat')
				expect(result.data.gender).toBe('female')
				expect(result.data.size).toBeUndefined()
			}
		})
	})

	describe('optional fields', () => {
		it('should accept empty object (all fields optional)', () => {
			const result = PublicAnimalFiltersSchema.safeParse({})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.type).toBeUndefined()
				expect(result.data.size).toBeUndefined()
				expect(result.data.gender).toBeUndefined()
			}
		})

		it('should accept undefined values for all fields', () => {
			const result = PublicAnimalFiltersSchema.safeParse({
				type: undefined,
				size: undefined,
				gender: undefined,
			})
			expect(result.success).toBe(true)
		})
	})

	describe('invalid enum values', () => {
		it('should reject invalid type value', () => {
			const result = PublicAnimalFiltersSchema.safeParse({ type: 'invalid' })
			expect(result.success).toBe(false)
		})

		it('should reject invalid size value', () => {
			const result = PublicAnimalFiltersSchema.safeParse({ size: 'huge' })
			expect(result.success).toBe(false)
		})

		it('should reject invalid gender value', () => {
			const result = PublicAnimalFiltersSchema.safeParse({ gender: 'unknown' })
			expect(result.success).toBe(false)
		})

		it('should reject number for type enum', () => {
			const result = PublicAnimalFiltersSchema.safeParse({ type: 123 })
			expect(result.success).toBe(false)
		})

		it('should reject boolean for size enum', () => {
			const result = PublicAnimalFiltersSchema.safeParse({ size: true })
			expect(result.success).toBe(false)
		})

		it('should reject invalid combined with one valid', () => {
			const result = PublicAnimalFiltersSchema.safeParse({
				type: 'dog',
				size: 'invalid',
			})
			expect(result.success).toBe(false)
		})
	})

	describe('TypeScript type inference', () => {
		it('should correctly infer optional literal types for filters', () => {
			const input: PublicAnimalFiltersInput = {
				type: 'dog',
				size: 'small',
				gender: 'male',
			}
			expect(input.type).toBe('dog')
			expect(input.size).toBe('small')
			expect(input.gender).toBe('male')
		})

		it('should allow undefined values in typed input', () => {
			const input: PublicAnimalFiltersInput = {}
			expect(input.type).toBeUndefined()
			expect(input.size).toBeUndefined()
			expect(input.gender).toBeUndefined()
		})
	})
})

describe('ListAnimalPublicSchema', () => {
	describe('pagination fields inclusion', () => {
		it('should include page field from paginationSchema', () => {
			const result = ListAnimalPublicSchema.safeParse({ page: 1 })
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.page).toBe(1)
			}
		})

		it('should include pageSize field from paginationSchema', () => {
			const result = ListAnimalPublicSchema.safeParse({ pageSize: 20 })
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.pageSize).toBe(20)
			}
		})

		it('should include orderBy field from paginationSchema', () => {
			const result = ListAnimalPublicSchema.safeParse({
				orderBy: 'name',
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.orderBy).toBe('name')
			}
		})

		it('should include orderDirection field from paginationSchema', () => {
			const result = ListAnimalPublicSchema.safeParse({
				orderDirection: 'asc',
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.orderDirection).toBe('asc')
			}
		})

		it('should include search field from paginationSchema', () => {
			const result = ListAnimalPublicSchema.safeParse({
				search: 'buddy',
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.search).toBe('buddy')
			}
		})

		it('should include all pagination fields together', () => {
			const result = ListAnimalPublicSchema.safeParse({
				page: 2,
				pageSize: 24,
				orderBy: 'name',
				orderDirection: 'desc',
				search: 'max',
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.page).toBe(2)
				expect(result.data.pageSize).toBe(24)
				expect(result.data.orderBy).toBe('name')
				expect(result.data.orderDirection).toBe('desc')
				expect(result.data.search).toBe('max')
			}
		})
	})

	describe('filter fields inclusion', () => {
		it('should include type filter from PublicAnimalFiltersSchema', () => {
			const result = ListAnimalPublicSchema.safeParse({ type: 'dog' })
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.type).toBe('dog')
			}
		})

		it('should include size filter from PublicAnimalFiltersSchema', () => {
			const result = ListAnimalPublicSchema.safeParse({ size: 'medium' })
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.size).toBe('medium')
			}
		})

		it('should include gender filter from PublicAnimalFiltersSchema', () => {
			const result = ListAnimalPublicSchema.safeParse({ gender: 'female' })
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.gender).toBe('female')
			}
		})

		it('should include all filter fields from PublicAnimalFiltersSchema', () => {
			const result = ListAnimalPublicSchema.safeParse({
				type: 'cat',
				size: 'small',
				gender: 'male',
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.type).toBe('cat')
				expect(result.data.size).toBe('small')
				expect(result.data.gender).toBe('male')
			}
		})
	})

	describe('valid combined pagination and filters', () => {
		it('should accept pagination with type filter', () => {
			const result = ListAnimalPublicSchema.safeParse({
				page: 1,
				pageSize: 12,
				type: 'dog',
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.page).toBe(1)
				expect(result.data.pageSize).toBe(12)
				expect(result.data.type).toBe('dog')
			}
		})

		it('should accept full pagination with all filters', () => {
			const result = ListAnimalPublicSchema.safeParse({
				page: 1,
				pageSize: 24,
				orderBy: 'name',
				orderDirection: 'asc',
				search: 'buddy',
				type: 'dog',
				size: 'small',
				gender: 'male',
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.page).toBe(1)
				expect(result.data.pageSize).toBe(24)
				expect(result.data.orderBy).toBe('name')
				expect(result.data.orderDirection).toBe('asc')
				expect(result.data.search).toBe('buddy')
				expect(result.data.type).toBe('dog')
				expect(result.data.size).toBe('small')
				expect(result.data.gender).toBe('male')
			}
		})

		it('should accept empty input (all fields optional)', () => {
			const result = ListAnimalPublicSchema.safeParse({})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.page).toBeUndefined()
				expect(result.data.pageSize).toBeUndefined()
				expect(result.data.type).toBeUndefined()
			}
		})
	})

	describe('pagination field validation', () => {
		it('should enforce page min value of 1', () => {
			const result = ListAnimalPublicSchema.safeParse({ page: 0 })
			expect(result.success).toBe(false)
		})

		it('should reject negative page value', () => {
			const result = ListAnimalPublicSchema.safeParse({ page: -1 })
			expect(result.success).toBe(false)
		})

		it('should enforce pageSize min value of 1', () => {
			const result = ListAnimalPublicSchema.safeParse({ pageSize: 0 })
			expect(result.success).toBe(false)
		})

		it('should enforce pageSize max value of 100', () => {
			const result = ListAnimalPublicSchema.safeParse({ pageSize: 101 })
			expect(result.success).toBe(false)
		})

		it('should accept pageSize at boundary of 100', () => {
			const result = ListAnimalPublicSchema.safeParse({ pageSize: 100 })
			expect(result.success).toBe(true)
		})

		it('should accept pageSize at boundary of 1', () => {
			const result = ListAnimalPublicSchema.safeParse({ pageSize: 1 })
			expect(result.success).toBe(true)
		})

		it('should enforce orderDirection enum values', () => {
			const result = ListAnimalPublicSchema.safeParse({
				orderDirection: 'invalid',
			})
			expect(result.success).toBe(false)
		})

		it('should accept valid orderDirection values', () => {
			const ascResult = ListAnimalPublicSchema.safeParse({
				orderDirection: 'asc',
			})
			const descResult = ListAnimalPublicSchema.safeParse({
				orderDirection: 'desc',
			})
			expect(ascResult.success).toBe(true)
			expect(descResult.success).toBe(true)
		})
	})

	describe('TypeScript type inference', () => {
		it('should correctly infer input type with pagination and filters', () => {
			const input: ListAnimalPublicInput = {
				page: 1,
				pageSize: 12,
				type: 'dog',
				size: 'small',
				gender: 'male',
			}
			expect(input.page).toBe(1)
			expect(input.pageSize).toBe(12)
			expect(input.type).toBe('dog')
			expect(input.size).toBe('small')
			expect(input.gender).toBe('male')
		})

		it('should allow partial input with optional fields', () => {
			const input: ListAnimalPublicInput = {
				type: 'cat',
			}
			expect(input.type).toBe('cat')
			expect(input.page).toBeUndefined()
		})
	})

	describe('filter validation', () => {
		it('should reject invalid type enum in combined input', () => {
			const result = ListAnimalPublicSchema.safeParse({
				page: 1,
				type: 'invalid',
			})
			expect(result.success).toBe(false)
		})

		it('should reject invalid size enum in combined input', () => {
			const result = ListAnimalPublicSchema.safeParse({
				pageSize: 12,
				size: 'huge',
			})
			expect(result.success).toBe(false)
		})

		it('should reject invalid gender enum in combined input', () => {
			const result = ListAnimalPublicSchema.safeParse({
				search: 'test',
				gender: 'unknown',
			})
			expect(result.success).toBe(false)
		})
	})
})
