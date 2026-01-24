import { useId } from 'react'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type AnimalType = 'dog' | 'cat' | 'other'
type AnimalSize = 'small' | 'medium' | 'big'
type AnimalGender = 'male' | 'female'

export interface FilterBarProps {
	searchTerm?: string
	type?: AnimalType
	size?: AnimalSize
	gender?: AnimalGender
	onSearchChange: (value: string) => void
	onTypeChange: (value: AnimalType | undefined) => void
	onSizeChange: (value: AnimalSize | undefined) => void
	onGenderChange: (value: AnimalGender | undefined) => void
	className?: string
}

const animalTypes: { value: AnimalType; label: string }[] = [
	{ value: 'dog', label: 'Dog' },
	{ value: 'cat', label: 'Cat' },
	{ value: 'other', label: 'Other' },
]

const animalSizes: { value: AnimalSize; label: string }[] = [
	{ value: 'small', label: 'Small' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'big', label: 'Big' },
]

const animalGenders: { value: AnimalGender; label: string }[] = [
	{ value: 'male', label: 'Male' },
	{ value: 'female', label: 'Female' },
]

export function FilterBar({
	searchTerm = '',
	type,
	size,
	gender,
	onSearchChange,
	onTypeChange,
	onSizeChange,
	onGenderChange,
	className,
}: FilterBarProps) {
	const searchInputId = useId()
	const typeFilterId = useId()
	const sizeFilterId = useId()
	const genderFilterId = useId()

	const handleTypeChange = (value: string) => {
		onTypeChange(value === 'all' ? undefined : (value as AnimalType))
	}

	const handleSizeChange = (value: string) => {
		onSizeChange(value === 'all' ? undefined : (value as AnimalSize))
	}

	const handleGenderChange = (value: string) => {
		onGenderChange(value === 'all' ? undefined : (value as AnimalGender))
	}

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onSearchChange(e.target.value || '')
	}

	return (
		<div
			data-slot="filter-bar"
			className={cn('mb-6 rounded-lg border bg-card p-4 shadow-sm', className)}
		>
			<div className="flex flex-wrap gap-4">
				<div className="flex-1 min-w-[200px]">
					<label
						htmlFor={searchInputId}
						className="mb-1.5 block text-sm font-medium text-foreground"
					>
						Search
					</label>
					<Input
						id={searchInputId}
						type="text"
						placeholder="Search by name..."
						value={searchTerm}
						onChange={handleSearchChange}
						aria-label="Search animals by name"
						data-slot="filter-search"
					/>
				</div>

				<div className="min-w-[150px]">
					<label
						htmlFor={typeFilterId}
						className="mb-1.5 block text-sm font-medium text-foreground"
					>
						Type
					</label>
					<Select value={type ?? 'all'} onValueChange={handleTypeChange}>
						<SelectTrigger
							id={typeFilterId}
							aria-label="Filter by animal type"
							data-slot="filter-type"
						>
							<SelectValue placeholder="All types" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All types</SelectItem>
							{animalTypes.map((animalType) => (
								<SelectItem key={animalType.value} value={animalType.value}>
									{animalType.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="min-w-[150px]">
					<label
						htmlFor={sizeFilterId}
						className="mb-1.5 block text-sm font-medium text-foreground"
					>
						Size
					</label>
					<Select value={size ?? 'all'} onValueChange={handleSizeChange}>
						<SelectTrigger
							id={sizeFilterId}
							aria-label="Filter by animal size"
							data-slot="filter-size"
						>
							<SelectValue placeholder="All sizes" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All sizes</SelectItem>
							{animalSizes.map((animalSize) => (
								<SelectItem key={animalSize.value} value={animalSize.value}>
									{animalSize.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="min-w-[150px]">
					<label
						htmlFor={genderFilterId}
						className="mb-1.5 block text-sm font-medium text-foreground"
					>
						Gender
					</label>
					<Select value={gender ?? 'all'} onValueChange={handleGenderChange}>
						<SelectTrigger
							id={genderFilterId}
							aria-label="Filter by animal gender"
							data-slot="filter-gender"
						>
							<SelectValue placeholder="All genders" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All genders</SelectItem>
							{animalGenders.map((animalGender) => (
								<SelectItem key={animalGender.value} value={animalGender.value}>
									{animalGender.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	)
}
