import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type AnimalType = 'dog' | 'cat' | 'other'
type AnimalSize = 'small' | 'medium' | 'big'
type AnimalGender = 'male' | 'female'

export interface AnimalCardProps {
	id: string
	name: string
	type: AnimalType
	size: AnimalSize
	gender: AnimalGender
	breed?: string | null
	age?: number | null
	imageUrl?: string | null
	description?: string | null
	className?: string
	to?: string
}

export function AnimalCard({
	id: _id,
	name,
	type,
	size,
	gender,
	breed,
	age,
	imageUrl,
	description,
	className,
	to,
}: AnimalCardProps) {
	const [imageLoaded, setImageLoaded] = useState(false)
	const [imageError, setImageError] = useState(false)

	const handleImageLoad = () => {
		setImageLoaded(true)
	}

	const handleImageError = () => {
		setImageLoaded(true)
		setImageError(true)
	}

	const cardContent = (
		<>
			{imageUrl && !imageError ? (
				<>
					{!imageLoaded && (
						<Skeleton
							className="aspect-square w-full"
							data-slot="animal-card-skeleton"
						/>
					)}
					<img
						src={imageUrl}
						alt={name}
						className={cn(
							'aspect-square w-full object-cover',
							!imageLoaded && 'absolute inset-0 opacity-0',
						)}
						loading="lazy"
						onLoad={handleImageLoad}
						onError={handleImageError}
						data-slot="animal-card-image"
					/>
				</>
			) : (
				<div
					className="flex aspect-square w-full items-center justify-center bg-muted"
					data-slot="animal-card-fallback"
				>
					<span className="text-4xl" role="img" aria-label="No image available">
						🐾
					</span>
				</div>
			)}
			<CardHeader>
				<CardTitle data-slot="animal-card-name">{name}</CardTitle>
				<CardDescription data-slot="animal-card-breed">
					{breed ? `${breed} · ${type}` : type}
				</CardDescription>
			</CardHeader>
			<CardContent className="flex-1">
				<div className="flex flex-wrap gap-2">
					<span
						className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
						data-slot="animal-card-size"
					>
						{size}
					</span>
					<span
						className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
						data-slot="animal-card-gender"
					>
						{gender}
					</span>
					{age !== null && age !== undefined && (
						<span
							className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
							data-slot="animal-card-age"
						>
							{age} months
						</span>
					)}
				</div>
				{description && (
					<p
						className="mt-3 line-clamp-3 text-sm text-muted-foreground"
						data-slot="animal-card-description"
					>
						{description}
					</p>
				)}
			</CardContent>
			<CardFooter>
				<Button className="w-full" data-slot="animal-card-button">
					View Details
				</Button>
			</CardFooter>
		</>
	)

	if (to) {
		return (
			<Link
				to={to}
				className={cn(
					'flex flex-col overflow-hidden transition-shadow hover:shadow-md',
					className,
				)}
				data-slot="animal-card-link"
			>
				<div
					className={cn(
						'bg-card text-card-foreground rounded-xl border shadow-sm h-full',
					)}
				>
					{cardContent}
				</div>
			</Link>
		)
	}

	return (
		<Card
			className={cn(
				'flex flex-col overflow-hidden transition-shadow hover:shadow-md',
				className,
			)}
			data-slot="animal-card"
		>
			{cardContent}
		</Card>
	)
}
