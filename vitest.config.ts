import { defineConfig } from 'vitest/config'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [viteReact(), viteTsConfigPaths()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: [],
		include: ['**/*.{test,spec}.{js,ts,tsx}'],
		exclude: ['node_modules', 'dist'],
	},
})
