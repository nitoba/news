import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { shelters } from './shelters'

export const shelterManagers = pgTable('shelter_managers', {
	shelterId: text('shelter_id')
		.notNull()
		.references(() => shelters.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
})
