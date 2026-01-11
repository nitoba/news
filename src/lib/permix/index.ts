import { createPermix } from 'permix/orpc'

export type UserRole = 'adopter' | 'donor' | 'both'

export interface AnimalData {
	id: string
	userId: string | null
	shelterId: string | null
}

export interface AdoptionRequestData {
	id: string
	userId: string
	animalId: string
}

export interface ShelterData {
	id: string
}

interface ShelterManagerData {
	userId: string
	shelterIds: string[]
}

type CRUD = 'create' | 'read' | 'update' | 'delete'

export type PermissionDefinition = {
	animals: {
		dataType: AnimalData
		action: CRUD
	}
	adoptionRequests: {
		dataType: AdoptionRequestData
		action: CRUD
	}
	shelters: {
		dataType: ShelterData
		action: CRUD
	}
}

export const {
	setup,
	checkMiddleware: checkPermissionMiddleware,
	template,
} = createPermix<PermissionDefinition>()

export const adminPermissions = template(() => ({
	animals: {
		create: true,
		read: true,
		update: true,
		delete: true,
	},
	adoptionRequests: {
		create: true,
		read: true,
		update: true,
		delete: true,
	},
	shelters: {
		create: true,
		read: true,
		update: true,
		delete: true,
	},
}))

export const adopterPermissions = template((userId: string) => ({
	animals: {
		create: false,
		read: true,
		update: false,
		delete: false,
	},
	adoptionRequests: {
		create: true,
		read: (request: AdoptionRequestData | undefined) =>
			request?.userId === userId,
		update: (request: AdoptionRequestData | undefined) =>
			request?.userId === userId,
		delete: (request: AdoptionRequestData | undefined) =>
			request?.userId === userId,
	},
	shelters: {
		create: false,
		read: true,
		update: false,
		delete: false,
	},
}))

export const donorPermissions = template((userId: string) => ({
	animals: {
		create: true,
		read: true,
		// TODO: Não atualizar animal que já foi doado?
		update: (animal: AnimalData | undefined) => animal?.userId === userId,
		// TODO: Não deletar animal que já foi doado?
		delete: (animal: AnimalData | undefined) => animal?.userId === userId,
	},
	adoptionRequests: {
		create: false,
		read: true,
		update: (request: AdoptionRequestData | undefined) =>
			request?.userId === userId,
		delete: (request: AdoptionRequestData | undefined) =>
			request?.userId === userId,
	},
	shelters: {
		create: false,
		read: true,
		update: false,
		delete: false,
	},
}))

export const bothPermissions = template((userId: string) => ({
	animals: {
		create: true,
		read: true,
		update: (animal: AnimalData | undefined) => animal?.userId === userId,
		delete: (animal: AnimalData | undefined) => animal?.userId === userId,
	},
	adoptionRequests: {
		create: true,
		read: (request: AdoptionRequestData | undefined) =>
			request?.userId === userId,
		update: (request: AdoptionRequestData | undefined) =>
			request?.userId === userId,
		delete: (request: AdoptionRequestData | undefined) =>
			request?.userId === userId,
	},
	shelters: {
		create: false,
		read: true,
		update: false,
		delete: false,
	},
}))

export const shelterManagerPermissions = template(
	(params: ShelterManagerData) => ({
		animals: {
			create: true,
			read: true,
			update: (animal: AnimalData | undefined) =>
				animal?.shelterId
					? params.shelterIds.includes(animal.shelterId)
					: false,
			delete: (animal: AnimalData | undefined) =>
				animal?.shelterId
					? params.shelterIds.includes(animal.shelterId)
					: false,
		},
		adoptionRequests: {
			create: false,
			read: (request: AdoptionRequestData | undefined) => {
				return request?.userId === params.userId
			},
			update: (request: AdoptionRequestData | undefined) => {
				return request?.userId === params.userId
			},
			delete: (request: AdoptionRequestData | undefined) => {
				return request?.userId === params.userId
			},
		},
		shelters: {
			create: false,
			read: true,
			update: (shelter: ShelterData | undefined) =>
				shelter ? params.shelterIds.includes(shelter.id) : false,
			delete: false,
		},
	}),
)
