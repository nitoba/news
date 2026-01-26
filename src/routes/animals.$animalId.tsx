import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { orpc } from '@/lib/orpc/client'

export const Route = createFileRoute('/animals/$animalId')({
	component: AnimalDetailPage,
})

export function AnimalDetailPage() {
	const { animalId } = Route.useParams()

	const animalQuery = useQuery(
		orpc.animals.get.queryOptions({
			input: { id: animalId },
		}),
	)

	return (
		<div className="min-h-screen bg-background">
			<main className="mx-auto max-w-4xl px-4 py-8">
				{animalQuery.isLoading ? (
					<LoadingState />
				) : animalQuery.isError ? (
					<ErrorState />
				) : !animalQuery.data ? (
					<NotFoundState />
				) : (
					<AnimalDetailContent animal={animalQuery.data} />
				)}
			</main>
		</div>
	)
}

function LoadingState() {
	return (
		<div className="space-y-6">
			<Link
				to="/animals"
				className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
			>
				← Back to Animals
			</Link>
			<Skeleton className="h-8 w-3/4" />
			<div className="grid gap-6 md:grid-cols-2">
				<Skeleton className="aspect-square w-full rounded-lg" />
				<div className="space-y-4">
					<Skeleton className="h-6 w-1/2" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</div>
			</div>
		</div>
	)
}

function ErrorState() {
	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
			<p className="mb-2 text-lg font-semibold text-foreground">
				Oops! Something went wrong
			</p>
			<p className="mb-4 text-muted-foreground">
				Failed to load animal details. Please try again later.
			</p>
			<Button onClick={() => window.location.reload()}>Try Again</Button>
		</div>
	)
}

function NotFoundState() {
	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
			<span
				className="mb-4 text-6xl"
				role="img"
				aria-label="Animal not found"
			>
				🐾
			</span>
			<p className="mb-2 text-lg font-semibold text-foreground">
				Animal not found
			</p>
			<p className="mb-4 text-muted-foreground">
				The animal you're looking for doesn't exist or has been adopted.
			</p>
			<Link to="/animals">
				<Button>Browse All Animals</Button>
			</Link>
		</div>
	)
}

interface AnimalDetailContentProps {
	animal: {
		id: string
		name: string
		type: 'dog' | 'cat' | 'other'
		breed: string | null
		age: number | null
		size: 'small' | 'medium' | 'big'
		gender: 'male' | 'female'
		color: string | null
		description: string | null
		healthInfo: string | null
		adoptionReason: string | null
		imageUrl: string | null
		shelterId: string | null
		isAdopted: boolean
		createdAt: Date
		updatedAt: Date
	}
}

function AnimalDetailContent({ animal }: AnimalDetailContentProps) {
	return (
		<article className="space-y-6">
			<Link
				to="/animals"
				className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
			>
				← Back to Animals
			</Link>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Image */}
				<div className="overflow-hidden rounded-lg border bg-muted">
					{animal.imageUrl ? (
						<img
							src={animal.imageUrl}
							alt={animal.name}
							className="aspect-square w-full object-cover"
							data-slot="animal-detail-image"
						/>
					) : (
						<div className="flex aspect-square w-full items-center justify-center">
							<span
								className="text-6xl"
								role="img"
								aria-label="No image available"
							>
								🐾
							</span>
						</div>
					)}
				</div>

				{/* Details */}
				<div className="flex flex-col space-y-4">
					<div>
						<h1 className="mb-2 text-3xl font-bold" data-slot="animal-detail-name">
							{animal.name}
						</h1>
						<p className="text-muted-foreground">
							{animal.breed ? `${animal.breed} · ` : ''}
							{animal.type}
						</p>
					</div>

					{/* Badges */}
					<div className="flex flex-wrap gap-2">
						<span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
							{animal.size}
						</span>
						<span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
							{animal.gender}
						</span>
						{animal.age !== null && (
							<span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
								{animal.age} months
							</span>
						)}
						{animal.color && (
							<span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
								{animal.color}
							</span>
						)}
					</div>

					{/* Status Badge */}
					{animal.isAdopted && (
						<div className="rounded-md bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400">
							✓ Adopted
						</div>
					)}

					{/* Description */}
					{animal.description && (
						<div>
							<h2 className="mb-2 text-lg font-semibold">About</h2>
							<p className="text-muted-foreground" data-slot="animal-detail-description">
								{animal.description}
							</p>
						</div>
					)}

					{/* Health Info */}
					{animal.healthInfo && (
						<div>
							<h2 className="mb-2 text-lg font-semibold">Health Info</h2>
							<p className="text-muted-foreground" data-slot="animal-detail-health">
								{animal.healthInfo}
							</p>
						</div>
					)}

					{/* Adoption Reason */}
					{animal.adoptionReason && (
						<div>
							<h2 className="mb-2 text-lg font-semibold">Adoption Reason</h2>
							<p className="text-muted-foreground" data-slot="animal-detail-adoption-reason">
								{animal.adoptionReason}
							</p>
						</div>
					)}

					{/* Shelter ID */}
					{animal.shelterId && (
						<div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
							<span className="font-medium">Shelter ID: </span>
							<span className="text-muted-foreground">{animal.shelterId}</span>
						</div>
					)}

					{/* Placeholder CTA */}
					<Button className="mt-auto" disabled={animal.isAdopted}>
						{animal.isAdopted ? 'Already Adopted' : 'Inquire About Adoption'}
					</Button>
				</div>
			</div>
		</article>
	)
}
