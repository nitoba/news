import type { ResponseHeadersPluginContext } from '@orpc/server/plugins'
import type { TanstackQueryOperationContext } from '@orpc/tanstack-query'
import type { Session, User } from 'better-auth'
import type { Logger } from 'pino'

export interface Context
	extends TanstackQueryOperationContext,
		ResponseHeadersPluginContext {
	logger?: Logger
	session?: Session
	user?: User
}
