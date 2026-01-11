import { randomUUID } from 'node:crypto'
import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'
import { user } from './auth'
import { shelters } from './shelters'

export const animalTypeEnum = pgEnum('animal_type', ['dog', 'cat', 'other'])
export const animalSizeEnum = pgEnum('animal_size', ['small', 'medium', 'big'])
export const animalGenderEnum = pgEnum('animal_gender', ['male', 'female'])

// Tabela de Animais
export const animals = pgTable('animals', {
	id: uuid('id')
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	// Relacionamento polimórfico: pode ser de um abrigo OU de um usuário
	shelterId: text('shelter_id').references(() => shelters.id, {
		onDelete: 'cascade',
	}),
	userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 255 }).notNull(),
	type: animalTypeEnum('type').notNull(),
	breed: varchar('breed', { length: 100 }),
	age: integer('age'), // idade em meses
	size: animalSizeEnum('size').notNull(),
	gender: animalGenderEnum('gender').notNull(),
	color: varchar('color', { length: 100 }),
	description: text('description'),
	healthInfo: text('health_info'), // vacinas, castração, etc
	adoptionReason: text('adoption_reason'), // motivo para doação (usuários)
	isAdopted: boolean('is_adopted').default(false).notNull(),
	imageUrl: varchar('image_url', { length: 500 }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
