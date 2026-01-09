import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { openAPI } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { env } from '@/env'

export type Auth = typeof auth

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema,
	}),
	session: {
		expiresIn: env.AUTH_SESSION_EXPIRATION_IN_SECONDS,
		updateAge: env.AUTH_SESSION_UPDATE_AGE_IN_SECONDS,
	},
	trustedOrigins: [env.CORS_ORIGIN],
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		// database: {
		// 	generateId: () => randomUUIDv7(),
		// },
		defaultCookieAttributes: {
			sameSite: 'none',
			secure: true,
			httpOnly: true,
		},
	},
	plugins: [
		openAPI(),
		tanstackStartCookies(),
		// admin({
		// 	...permissions,
		// }),
	],
})
