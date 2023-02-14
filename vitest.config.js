import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	test: {
		globals: true,
		include: [
			'**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
			'tests/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
		],
		includeSource: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	}
})
