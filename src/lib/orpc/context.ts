import type { ResponseHeadersPluginContext } from '@orpc/server/plugins'
import type { TanstackQueryOperationContext } from '@orpc/tanstack-query'

export interface Context
	extends TanstackQueryOperationContext,
		ResponseHeadersPluginContext {}
