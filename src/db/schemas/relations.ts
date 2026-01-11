import { relations } from 'drizzle-orm'
import { adoptionRequests } from './adoption-requests'
import { animals } from './animals'
import { account, session, user } from './auth'
import { shelters } from './shelters'

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	// App With User Relations
	adoptionRequests: many(adoptionRequests),
	animalsForAdoption: many(animals), // animais que o usuário está doando
}))

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}))

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}))

// App Relations

export const sheltersRelations = relations(shelters, ({ many }) => ({
	animals: many(animals),
}))

export const animalsRelations = relations(animals, ({ one, many }) => ({
	shelter: one(shelters, {
		fields: [animals.shelterId],
		references: [shelters.id],
	}),
	owner: one(user, {
		fields: [animals.userId],
		references: [user.id],
	}),
	adoptionRequests: many(adoptionRequests),
}))

export const adoptionRequestsRelations = relations(
	adoptionRequests,
	({ one }) => ({
		user: one(user, {
			fields: [adoptionRequests.userId],
			references: [user.id],
		}),
		animal: one(animals, {
			fields: [adoptionRequests.animalId],
			references: [animals.id],
		}),
	}),
)
