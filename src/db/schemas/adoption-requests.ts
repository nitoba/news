import { randomUUID } from 'node:crypto'
import {
	boolean,
	pgEnum,
	pgTable,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core'
import { animals } from './animals'
import { user } from './auth'

export const adoptionStatusEnum = pgEnum('adoption_status', [
	'pending',
	'approved',
	'rejected',
	'completed',
])

// Tabela de Solicitações de Adoção
export const adoptionRequests = pgTable('adoption_requests', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	animalId: text('animal_id')
		.notNull()
		.references(() => animals.id),
	status: adoptionStatusEnum('status').default('pending').notNull(),
	message: text('message'), // mensagem do adotante
	hasExperience: boolean('has_experience').default(false),
	hasOtherPets: boolean('has_other_pets').default(false),
	hasChildren: boolean('has_children').default(false),
	houseType: varchar('house_type', { length: 50 }), // casa, apartamento
	feedback: text('feedback'), // feedback do doador/abrigo sobre a solicitação
	requestedAt: timestamp('requested_at').defaultNow().notNull(),
	respondedAt: timestamp('responded_at'),
	completedAt: timestamp('completed_at'),
})
