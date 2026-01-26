import { defineConfig } from 'vitest/config'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [viteReact(), viteTsConfigPaths()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/test-setup.ts'],
		include: ['**/*.{test,spec}.{js,ts,tsx}'],
		exclude: ['node_modules', 'dist', '.opencode', 'opensrc'],
		poolOptions: {
			threads: {
				singleThread: true,
			},
		},
		// Set NODE_ENV=test for React 19 compatibility
		// React 19's act is only available in development builds
		env: {
			NODE_ENV: 'test',
		},
	},
})
