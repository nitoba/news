import { createComponents, PermixProvider } from 'permix/react'
import type { PropsWithChildren } from 'react'
import { type PermissionDefinition, permix } from '.'

export const { Check } = createComponents<PermissionDefinition>(permix as any)

export function PermissionsProvider({ children }: PropsWithChildren) {
	return <PermixProvider permix={permix as any}>{children}</PermixProvider>
}
