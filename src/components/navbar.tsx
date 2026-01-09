import { Link } from '@tanstack/react-router'
import { authClient } from '@/lib/auth/client'
import { ThemeToggle } from './theme-toggle'
import { buttonVariants } from './ui/button'

export function Navbar() {
	const { data: session, isPending } = authClient.useSession()

	return (
		<nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
				<div className="flex items-center gap-2">
					<img
						src="https://tanstack.com/images/logos/logo-color-banner-600.png"
						alt="TanStack Start Logo"
						className="size-8"
					/>
					<h1 className="text-lg font-semibold">News</h1>
				</div>

				<div className="flex items-center gap-3">
					<ThemeToggle />
					{isPending ? null : session ? (
						<Link to="/dashboard" className={buttonVariants()}>
							Dashboard
						</Link>
					) : (
						<>
							<Link
								to="/sign-in"
								className={buttonVariants({ variant: 'secondary' })}
							>
								Login
							</Link>
							<Link to="/sign-up" className={buttonVariants()}>
								Get Started
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	)
}
