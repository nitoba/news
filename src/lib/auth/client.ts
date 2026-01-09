import { createAuthClient } from 'better-auth/react'

// Get the base URL based on the environment
const getBaseURL = (): string => {
	if (typeof window !== 'undefined') {
		return window.location.origin
	}

	// Fallback to the server URL from environment variables
	return ''
}

export const authClient = createAuthClient({
	baseURL: getBaseURL(),
})
