import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import Loader from '@/components/loader'
import { Navbar } from '@/components/navbar'
import { orpc } from '@/lib/orpc/client'

export const Route = createFileRoute('/')({ component: App })

function App() {
	const { data, isPending } = useQuery(orpc.list.queryOptions())
	return (
		<div className="min-h-screen bg-background">
			{/* Navigation */}
			<Navbar />

			{isPending ? <Loader /> : data}
		</div>
	)
}
