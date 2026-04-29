import { defineConfig,loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const envConfig = loadEnv(mode, './')

  return {
  plugins: [vue()],
  server: {
			port: envConfig.VITE_PORT,
			proxy: {
				'/api': {
					target: envConfig.VITE_API_BASEURL,
					ws: false,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, '')
				},
				'/wsApi': {
					target: envConfig.VITE_API_BASEURL,
					ws: true,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/wsApi/, '')
				}
			}
		},
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}
})
