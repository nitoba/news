import { randomUUID } from 'node:crypto'
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

// Tabela de ONGs/Abrigos
export const shelters = pgTable('shelters', {
	id: uuid('id')
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	phone: varchar('phone', { length: 20 }).notNull(),
	cnpj: varchar('cnpj', { length: 18 }).unique(),
	description: text('description'),
	address: text('address').notNull(),
	city: varchar('city', { length: 100 }).notNull(),
	state: varchar('state', { length: 2 }).notNull(),
	zipCode: varchar('zip_code', { length: 10 }).notNull(),
	website: varchar('website', { length: 255 }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
