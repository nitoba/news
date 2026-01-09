import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import Loader from './components/loader'
import * as TanstackQuery from './lib/tanstack-query/root-provider'

import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
	const rqContext = TanstackQuery.getContext()

	const router = createTanStackRouter({
		routeTree,
		context: {
			...rqContext,
		},
		defaultPendingComponent: () => <Loader />,
		defaultNotFoundComponent: () => <div>Not Found</div>,

		defaultPreload: 'intent',
	})

	setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient })

	return router
}

declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof getRouter>
	}
}
