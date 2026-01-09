import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

const isProd = process.env.NODE_ENV
	? process.env.NODE_ENV === 'production'
	: import.meta.env?.PROD

console.log(import.meta.env)

export const env = createEnv({
	server: {
		SERVER_URL: z.url().optional(),
		DATABASE_URL: z
			.string()
			.refine((value) => value.startsWith('postgresql://')),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		NODE_ENV: z
			.enum(['development', 'production', 'test'])
			.default('development'),
		AUTH_SESSION_EXPIRATION_IN_SECONDS: z.coerce
			.number()
			.int()
			.prefault(2_592_000), // 30 days by default
		AUTH_SESSION_UPDATE_AGE_IN_SECONDS: z.coerce
			.number()
			.int()
			.prefault(86_400), // 1 day by default
		AUTH_TRUSTED_ORIGINS: z
			.string()
			.optional()
			.transform((stringValue) => stringValue?.split(',').map((v) => v.trim())),

		EMAIL_SERVER: z.url(),
		EMAIL_FROM: z.string(),

		LOGGER_LEVEL: z
			.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
			.prefault(isProd ? 'error' : 'info'),
		LOGGER_PRETTY: z
			.enum(['true', 'false'])
			.prefault(isProd ? 'false' : 'true')
			.transform((value) => value === 'true'),
	},

	/**
	 * The prefix that client-side variables must have. This is enforced both at
	 * a type-level and at runtime.
	 */
	clientPrefix: 'VITE_',

	client: {
		VITE_APP_TITLE: z.string().min(1).optional(),
	},

	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnv: process.env ?? import.meta.env,

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: true,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
