import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envConfig = loadEnv(mode, './')
  const isProd = mode !== 'development'
  const port = Number(envConfig.VITE_PORT) || 5173

  return {
    base: isProd ? '/produce/' : '/',
    plugins: [vue()],
    server: {
      port,
      proxy: {
        '/api': {
          target: envConfig.VITE_API_BASEURL,
          ws: false,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/wsApi': {
          target: envConfig.VITE_API_BASEURL,
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/wsApi/, ''),
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
