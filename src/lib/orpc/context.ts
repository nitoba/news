import type { ResponseHeadersPluginContext } from '@orpc/server/plugins'
import type { TanstackQueryOperationContext } from '@orpc/tanstack-query'
import type { Session, User } from 'better-auth'
import type { Logger } from 'pino'
import type { setup } from '../permix'
import type { UserType } from '../services/types/user-type'

export interface Context
	extends TanstackQueryOperationContext,
		ResponseHeadersPluginContext {
	logger?: Logger
	session?: Session
	user?: User & { userType?: UserType }
	permix?: ReturnType<typeof setup>
}
