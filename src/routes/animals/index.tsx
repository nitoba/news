import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimalCard } from '@/components/animals/animal-card'
import { orpc } from '@/lib/orpc/client'

type AnimalType = 'dog' | 'cat' | 'other'
type AnimalSize = 'small' | 'medium' | 'big'
type AnimalGender = 'male' | 'female'

export const Route = createFileRoute('/animals/')({
	component: AnimalsPage,
})

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

function AnimalsPage() {
	const [filters, setFilters] = useState<{
		type?: AnimalType
		size?: AnimalSize
		gender?: AnimalGender
		search?: string
		page: number
		pageSize: number
	}>({
		page: 1,
		pageSize: 12,
	})

	const animalsQuery = useQuery(
		orpc.animals.getPublic.queryOptions({
			input: {
				page: filters.page,
				pageSize: filters.pageSize,
				type: filters.type,
				size: filters.size,
				gender: filters.gender,
				search: filters.search,
			},
		}),
	)

	const handleTypeChange = (value: string) => {
		setFilters((prev) => ({
			...prev,
			type: value === 'all' ? undefined : (value as AnimalType),
			page: 1,
		}))
	}

	const handleSizeChange = (value: string) => {
		setFilters((prev) => ({
			...prev,
			size: value === 'all' ? undefined : (value as AnimalSize),
			page: 1,
		}))
	}

	const handleGenderChange = (value: string) => {
		setFilters((prev) => ({
			...prev,
			gender: value === 'all' ? undefined : (value as AnimalGender),
			page: 1,
		}))
	}

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFilters((prev) => ({
			...prev,
			search: e.target.value || undefined,
			page: 1,
		}))
	}

	const handlePreviousPage = () => {
		setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
	}

	const handleNextPage = () => {
		setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
	}

	const hasFilters =
		filters.type || filters.size || filters.gender || filters.search

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			<main className="mx-auto max-w-7xl px-4 py-8">
				<div className="mb-8">
					<h1 className="mb-2 text-3xl font-bold">Adoptable Animals</h1>
					<p className="text-muted-foreground">
						Browse our adorable friends looking for a loving home
					</p>
				</div>

				{/* Filter Bar */}
				<div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
					<div className="flex flex-wrap gap-4">
						<div className="flex-1 min-w-[200px]">
							<label
								htmlFor="animals-search-input"
								className="mb-1.5 block text-sm font-medium text-foreground"
							>
								Search
							</label>
							<Input
								id="animals-search-input"
								type="text"
								placeholder="Search by name..."
								value={filters.search ?? ''}
								onChange={handleSearchChange}
								aria-label="Search animals by name"
							/>
						</div>

						<div className="min-w-[150px]">
							<label
								htmlFor="animals-type-filter"
								className="mb-1.5 block text-sm font-medium text-foreground"
							>
								Type
							</label>
							<Select
								value={filters.type ?? 'all'}
								onValueChange={handleTypeChange}
							>
								<SelectTrigger
									id="animals-type-filter"
									aria-label="Filter by animal type"
								>
									<SelectValue placeholder="All types" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All types</SelectItem>
									{animalTypes.map((type) => (
										<SelectItem key={type.value} value={type.value}>
											{type.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="min-w-[150px]">
							<label
								htmlFor="animals-size-filter"
								className="mb-1.5 block text-sm font-medium text-foreground"
							>
								Size
							</label>
							<Select
								value={filters.size ?? 'all'}
								onValueChange={handleSizeChange}
							>
								<SelectTrigger
									id="animals-size-filter"
									aria-label="Filter by animal size"
								>
									<SelectValue placeholder="All sizes" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All sizes</SelectItem>
									{animalSizes.map((size) => (
										<SelectItem key={size.value} value={size.value}>
											{size.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="min-w-[150px]">
							<label
								htmlFor="animals-gender-filter"
								className="mb-1.5 block text-sm font-medium text-foreground"
							>
								Gender
							</label>
							<Select
								value={filters.gender ?? 'all'}
								onValueChange={handleGenderChange}
							>
								<SelectTrigger
									id="animals-gender-filter"
									aria-label="Filter by animal gender"
								>
									<SelectValue placeholder="All genders" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All genders</SelectItem>
									{animalGenders.map((gender) => (
										<SelectItem key={gender.value} value={gender.value}>
											{gender.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				{/* Animals Grid */}
				{animalsQuery.isLoading ? (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{Array.from({ length: 8 }).map((_, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton
							<div
								key={index}
								className="bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm"
							>
								<Skeleton className="aspect-square w-full" />
								<div className="flex flex-col space-y-1.5 p-6">
									<Skeleton className="h-6 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
								</div>
								<div className="p-6 pt-0">
									<Skeleton className="mb-2 h-4 w-full" />
									<Skeleton className="mb-2 h-4 w-full" />
									<Skeleton className="h-4 w-2/3" />
								</div>
							</div>
						))}
					</div>
				) : animalsQuery.isError ? (
					<div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
						<p className="text-lg font-semibold text-foreground">
							Oops! Something went wrong
						</p>
						<p className="mb-4 text-muted-foreground">
							Failed to load animals. Please try again later.
						</p>
						<Button onClick={() => animalsQuery.refetch()}>Try Again</Button>
					</div>
				) : animalsQuery.data && animalsQuery.data.length > 0 ? (
					<>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{animalsQuery.data.map((animal) => (
								<AnimalCard
									key={animal.id}
									id={animal.id}
									name={animal.name}
									type={animal.type}
									size={animal.size}
									gender={animal.gender}
									breed={animal.breed}
									age={animal.age}
									imageUrl={animal.imageUrl}
									description={animal.description}
									to={`/animals/${animal.id}`}
								/>
							))}
						</div>

						{/* Pagination */}
						<div className="mt-8 flex items-center justify-between">
							<Button
								variant="outline"
								onClick={handlePreviousPage}
								disabled={filters.page <= 1}
								aria-label="Previous page"
							>
								Previous
							</Button>
							<span className="text-sm text-muted-foreground">
								Page {filters.page}
							</span>
							<Button
								variant="outline"
								onClick={handleNextPage}
								disabled={
									!animalsQuery.data ||
									animalsQuery.data.length < filters.pageSize
								}
								aria-label="Next page"
							>
								Next
							</Button>
						</div>
					</>
				) : (
					<div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
						<span
							className="mb-4 text-6xl"
							role="img"
							aria-label="No animals found"
						>
							🔍
						</span>
						<p className="text-lg font-semibold text-foreground">
							{hasFilters
								? 'No animals match your filters'
								: 'No animals available'}
						</p>
						<p className="mb-4 text-muted-foreground">
							{hasFilters
								? 'Try adjusting your filters to see more results'
								: 'Check back later for new arrivals'}
						</p>
						{hasFilters && (
							<Button
								variant="outline"
								onClick={() =>
									setFilters({
										type: undefined,
										size: undefined,
										gender: undefined,
										search: undefined,
										page: 1,
										pageSize: 12,
									})
								}
							>
								Clear Filters
							</Button>
						)}
					</div>
				)}
			</main>
		</div>
	)
}
