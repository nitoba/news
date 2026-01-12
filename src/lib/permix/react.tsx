import { createComponents, PermixProvider } from 'permix/react'
import type { PropsWithChildren } from 'react'
import { type PermissionDefinition, permix } from '.'

export const { Check } = createComponents<PermissionDefinition>(permix as any)

export function PermissionsProvider({ children }: PropsWithChildren) {
	return <PermixProvider permix={permix as any}>{children}</PermixProvider>
}

// export const WithPermissions = (props: {
// 	permissions: Permission[]
// 	children?: ReactNode
// 	loadingFallback?: ReactNode
// 	fallback?: ReactNode
// }) => {
// 	const session = authClient.useSession()
// 	const userRole = session.data?.user.role

// 	if (session.isPending) {
// 		return props.loadingFallback ?? props.fallback ?? null
// 	}

// 	if (
// 		!userRole ||
// 		props.permissions.every(
// 			(permission) =>
// 				!authClient.admin.checkRolePermission({
// 					role: userRole as Role,
// 					permission: permission,
// 				}),
// 		)
// 	) {
// 		return props.fallback ?? null
// 	}

// 	return props.children
// }
