import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FilterBar } from './filter-bar'

describe('FilterBar', () => {
	describe('rendering', () => {
		it('should render all filter controls', () => {
			const mocks = {
				onSearchChange: vi.fn(),
				onTypeChange: vi.fn(),
				onSizeChange: vi.fn(),
				onGenderChange: vi.fn(),
			}

			render(<FilterBar {...mocks} />)

			// Search input
			expect(
				screen.getByRole('textbox', { name: /search animals by name/i }),
			).toBeInTheDocument()

			// Type filter
			expect(
				screen.getByLabelText(/filter by animal type/i),
			).toBeInTheDocument()
			expect(screen.getByLabelText(/type/i)).toBeInTheDocument()

			// Size filter
			expect(
				screen.getByLabelText(/filter by animal size/i),
			).toBeInTheDocument()
			expect(screen.getByLabelText(/size/i)).toBeInTheDocument()

			// Gender filter
			expect(
				screen.getByLabelText(/filter by animal gender/i),
			).toBeInTheDocument()
			expect(screen.getByLabelText(/gender/i)).toBeInTheDocument()
		})

		it('should display current filter values', () => {
			const mocks = {
				searchTerm: 'Buddy',
				type: 'dog' as const,
				size: 'medium' as const,
				gender: 'male' as const,
				onSearchChange: vi.fn(),
				onTypeChange: vi.fn(),
				onSizeChange: vi.fn(),
				onGenderChange: vi.fn(),
			}

			render(<FilterBar {...mocks} />)

			const searchInput = screen.getByRole('textbox', {
				name: /search animals by name/i,
			})
			expect(searchInput).toHaveValue('Buddy')
		})

		it('should render with custom className', () => {
			const mocks = {
				onSearchChange: vi.fn(),
				onTypeChange: vi.fn(),
				onSizeChange: vi.fn(),
				onGenderChange: vi.fn(),
				className: 'custom-class',
			}

			const { container } = render(<FilterBar {...mocks} />)
			const filterBar = container.querySelector('[data-slot="filter-bar"]')
			expect(filterBar).toHaveClass('custom-class')
		})
	})

	describe('search input', () => {
		it('should call onSearchChange when input value changes', async () => {
			const user = userEvent.setup()
			const onSearchChange = vi.fn()
			const mocks = {
				onSearchChange,
				onTypeChange: vi.fn(),
				onSizeChange: vi.fn(),
				onGenderChange: vi.fn(),
			}

			render(<FilterBar {...mocks} />)

			const searchInput = screen.getByRole('textbox', {
				name: /search animals by name/i,
			})
			await user.clear(searchInput)
			await user.type(searchInput, 'Buddy')

			expect(onSearchChange).toHaveBeenCalledWith('Buddy')
		})

		it('should display placeholder text', () => {
			const mocks = {
				onSearchChange: vi.fn(),
				onTypeChange: vi.fn(),
				onSizeChange: vi.fn(),
				onGenderChange: vi.fn(),
			}

			render(<FilterBar {...mocks} />)

			const searchInput = screen.getByPlaceholderText(/search by name/i)
			expect(searchInput).toBeInTheDocument()
		})
	})

	describe('type filter', () => {
		it('should call onTypeChange with undefined when "All types" is selected', async () => {
			const user = userEvent.setup()
			const onTypeChange = vi.fn()
			const mocks = {
				type: 'dog' as const,
				onSearchChange: vi.fn(),
				onTypeChange,
				onSizeChange: vi.fn(),
				onGenderChange: vi.fn(),
			}

			render(<FilterBar {...mocks} />)

			const typeSelect = screen.getByLabelText(/filter by animal type/i)
			await user.click(typeSelect)

			const allTypesOption = screen.getByText('All types')
			await user.click(allTypesOption)

			expect(onTypeChange).toHaveBeenCalledWith(undefined)
		})

		it('should call onTypeChange with animal type when specific type is selected', async () => {
			const user = userEvent.setup()
			const onTypeChange = vi.fn()
			const mocks = {
				onSearchChange: vi.fn(),
				onTypeChange,
				onSizeChange: vi.fn(),
				onGenderChange: vi.fn(),
			}

			render(<FilterBar {...mocks} />)

			const typeSelect = screen.getByLabelText(/filter by animal type/i)
			await user.click(typeSelect)

			const catOption = screen.getByText('Cat')
			await user.click(catOption)

			expect(onTypeChange).toHaveBeenCalledWith('cat')
		})

		it('should display all type options', async () => {
			const user = userEvent.setup()
			const mocks = {
				onSearchChange: vi.fn(),
				onTypeChange: vi.fn(),
				onSizeChange: vi.fn(),
				onGenderChange: vi.fn(),
			}

			render(<FilterBar {...mocks} />)

			const typeSelect = screen.getByLabelText(/filter by animal type/i)
			await user.click(typeSelect)

			expect(screen.getByText('All types')).toBeInTheDocument()
			expect(screen.getByText('Dog')).toBeInTheDocument()
			expect(screen.getByText('Cat')).toBeInTheDocument()
			expect(screen.getByText('Other')).toBeInTheDocument()
		})
	})

	describe('size filter', () => {
		it('should call onSizeChange with undefined when "All sizes" is selected', async () => {
			const user = userEvent.setup()
			const onSizeChange = vi.fn()
			const mocks = {
				size: 'small' as const,
				onSearchChange: vi.fn(),
				onTypeChange: vi.fn(),
				onSizeChange,
				onGenderChange: vi.fn(),
			}

			render(<FilterBar {...mocks} />)

			const sizeSelect = screen.getByLabelText(/filter by animal size/i)
			await user.click(sizeSelect)

			const allSizesOption = screen.getByText('All sizes')
			await user.click(allSizesOption)

			expect(onSizeChange).toHaveBeenCalledWith(undefined)
		})

		it('should call onSizeChange with size when specific size is selected', async () => {
			const user = userEvent.setup()
			const onSizeChange = vi.fn()
			const mocks = {
				onSearchChange: vi.fn(),
				onTypeChange: vi.fn(),
				onSizeChange,
				onGenderChange: vi.fn(),
			}

			render(<FilterBar {...mocks} />)

			const sizeSelect = screen.getByLabelText(/filter by animal size/i)
			await user.click(sizeSelect)

			const mediumOption = screen.getByText('Medium')
			await user.click(mediumOption)

			expect(onSizeChange).toHaveBeenCalledWith('medium')
		})

		it('should display all size options', async () => {
			const user = userEvent.setup()
			const mocks = {
				onSearchChange: vi.fn(),
				onTypeChange: vi.fn(),
				onSizeChange: vi.fn(),
				onGenderChange: vi.fn(),
			}

			render(<FilterBar {...mocks} />)

			const sizeSelect = screen.getByLabelText(/filter by animal size/i)
			await user.click(sizeSelect)

			expect(screen.getByText('All sizes')).toBeInTheDocument()
			expect(screen.getByText('Small')).toBeInTheDocument()
			expect(screen.getByText('Medium')).toBeInTheDocument()
			expect(screen.getByText('Big')).toBeInTheDocument()
		})
	})

	describe('gender filter', () => {
		it('should call onGenderChange with undefined when "All genders" is selected', async () => {
			const user = userEvent.setup()
			const onGenderChange = vi.fn()
			const mocks = {
				gender: 'male' as const,
				onSearchChange: vi.fn(),
				onTypeChange: vi.fn(),
				onSizeChange: vi.fn(),
				onGenderChange,
			}

			render(<FilterBar {...mocks} />)

			const genderSelect = screen.getByLabelText(/filter by animal gender/i)
			await user.click(genderSelect)

			const allGendersOption = screen.getByText('All genders')
			await user.click(allGendersOption)

			expect(onGenderChange).toHaveBeenCalledWith(undefined)
		})

		it('should call onGenderChange with gender when specific gender is selected', async () => {
			const user = userEvent.setup()
			const onGenderChange = vi.fn()
			const mocks = {
				onSearchChange: vi.fn(),
				onTypeChange: vi.fn(),
				onSizeChange: vi.fn(),
				onGenderChange,
			}

			render(<FilterBar {...mocks} />)

			const genderSelect = screen.getByLabelText(/filter by animal gender/i)
			await user.click(genderSelect)

			const femaleOption = screen.getByText('Female')
			await user.click(femaleOption)

			expect(onGenderChange).toHaveBeenCalledWith('female')
		})

		it('should display all gender options', async () => {
			const user = userEvent.setup()
			const mocks = {
				onSearchChange: vi.fn(),
				onTypeChange: vi.fn(),
				onSizeChange: vi.fn(),
				onGenderChange: vi.fn(),
			}

			render(<FilterBar {...mocks} />)

			const genderSelect = screen.getByLabelText(/filter by animal gender/i)
			await user.click(genderSelect)

			expect(screen.getByText('All genders')).toBeInTheDocument()
			expect(screen.getByText('Male')).toBeInTheDocument()
			expect(screen.getByText('Female')).toBeInTheDocument()
		})
	})

	describe('accessibility', () => {
		it('should have proper labels for all inputs', () => {
			const mocks = {
				onSearchChange: vi.fn(),
				onTypeChange: vi.fn(),
				onSizeChange: vi.fn(),
				onGenderChange: vi.fn(),
			}

			render(<FilterBar {...mocks} />)

			// Search input has aria-label
			expect(
				screen.getByRole('textbox', { name: /search animals by name/i }),
			).toBeInTheDocument()

			// All selects have aria-labels
			expect(
				screen.getByLabelText(/filter by animal type/i),
			).toBeInTheDocument()
			expect(
				screen.getByLabelText(/filter by animal size/i),
			).toBeInTheDocument()
			expect(
				screen.getByLabelText(/filter by animal gender/i),
			).toBeInTheDocument()

			// Visual labels are also present
			expect(screen.getByLabelText(/type/i)).toBeInTheDocument()
			expect(screen.getByLabelText(/size/i)).toBeInTheDocument()
			expect(screen.getByLabelText(/gender/i)).toBeInTheDocument()
		})

		it('should associate labels with inputs using htmlFor', () => {
			const mocks = {
				onSearchChange: vi.fn(),
				onTypeChange: vi.fn(),
				onSizeChange: vi.fn(),
				onGenderChange: vi.fn(),
			}

			render(<FilterBar {...mocks} />)

			const searchInput = screen.getByRole('textbox', {
				name: /search animals by name/i,
			})
			expect(searchInput.id).toBe('animals-search-input')

			const typeSelect = screen.getByLabelText(/filter by animal type/i)
			expect(typeSelect.id).toBe('animals-type-filter')

			const sizeSelect = screen.getByLabelText(/filter by animal size/i)
			expect(sizeSelect.id).toBe('animals-size-filter')

			const genderSelect = screen.getByLabelText(/filter by animal gender/i)
			expect(genderSelect.id).toBe('animals-gender-filter')
		})
	})

	describe('data-slot attributes', () => {
		it('should include data-slot attributes for component identification', () => {
			const mocks = {
				onSearchChange: vi.fn(),
				onTypeChange: vi.fn(),
				onSizeChange: vi.fn(),
				onGenderChange: vi.fn(),
			}

			const { container } = render(<FilterBar {...mocks} />)

			expect(
				container.querySelector('[data-slot="filter-bar"]'),
			).toBeInTheDocument()
			expect(
				container.querySelector('[data-slot="filter-search"]'),
			).toBeInTheDocument()
			expect(
				container.querySelector('[data-slot="filter-type"]'),
			).toBeInTheDocument()
			expect(
				container.querySelector('[data-slot="filter-size"]'),
			).toBeInTheDocument()
			expect(
				container.querySelector('[data-slot="filter-gender"]'),
			).toBeInTheDocument()
		})
	})
})
