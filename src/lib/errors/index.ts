import { TaggedError } from 'better-result'

export class NotFoundError extends TaggedError('NotFoundError')<{
	resource: string
	id: string
	message: string
}>() {
	constructor(args: { resource: string; id: string }) {
		super({
			resource: args.resource,
			id: args.id,
			message: `${args.resource} not found: ${args.id}`,
		})
	}
}

export class ValidationError extends TaggedError('ValidationError')<{
	field: string
	message: string
}>() {
	constructor(args: { field: string; message: string }) {
		super(args)
	}
}

export class DatabaseError extends TaggedError('DatabaseError')<{
	operation: string
	message: string
	cause?: unknown
}>() {
	constructor(args: { operation: string; cause?: unknown }) {
		const msg =
			args.cause instanceof Error
				? args.cause.message
				: String(args.cause ?? 'unknown error')
		super({
			operation: args.operation,
			message: `DB ${args.operation} failed: ${msg}`,
			cause: args.cause,
		})
	}
}

export class PermissionDeniedError extends TaggedError(
	'PermissionDeniedError',
)<{
	resource: string
	action: string
	message: string
}>() {
	constructor(args: { resource: string; action: string }) {
		super({
			resource: args.resource,
			action: args.action,
			message: `Permission denied for ${args.action} on ${args.resource}`,
		})
	}
}

export class InfrastructureError extends TaggedError('InfrastructureError')<{
	message: string
	cause?: unknown
}>() {
	constructor(args: { message: string; cause?: unknown }) {
		super({
			message: args.message,
			cause: args.cause,
		})
	}
}

export type AppError =
	| NotFoundError
	| ValidationError
	| DatabaseError
	| PermissionDeniedError
	| InfrastructureError
