import { usePermix } from 'permix/react'
import { type PermissionDefinition, permix } from '../lib/permix'

export function usePermissions() {
	return usePermix<PermissionDefinition>(permix as any)
}
