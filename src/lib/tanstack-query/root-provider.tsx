import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpc } from '../orpc/client'

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error, query) => {
			toast.error(`Error: ${error.message}`, {
				action: {
					label: 'retry',
					onClick: query.invalidate,
				},
			})
		},
	}),
})

export function getContext() {
	return {
		orpc,
		queryClient,
	}
}
