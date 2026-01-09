import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { RouterClient } from '@orpc/server'
import { createRouterClient } from '@orpc/server'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { type Router, router } from './router'

const getORPCClient = createIsomorphicFn()
	.server(() =>
		createRouterClient(router, {
			context: {
				headers: getRequestHeaders(),
			},
		}),
	)
	.client((): RouterClient<Router> => {
		const link = new RPCLink({
			url: `${window.location.origin}/api/rpc`,
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: 'include',
				})
			},
		})
		return createORPCClient(link)
	})

export const client: RouterClient<Router> = getORPCClient()

export const orpc = createTanstackQueryUtils(client)
