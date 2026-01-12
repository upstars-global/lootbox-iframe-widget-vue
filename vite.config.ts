import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { themesPlugin } from './vite/plugins/vite-plugin-themes'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    /**
     * Middleware для обробки query params в dev режимі
     * Vite не вміє обробляти ?t=123 для статичних файлів — повертає 404
     * Цей плагін прибирає query params для файлів тем, щоб cache busting працював локально
     */
    {
      name: 'strip-query-params-for-themes',
      enforce: 'pre' as const,
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url?.includes('/themes/') && req.url.includes('?')) {
            req.url = req.url.split('?')[0]
          }
          next()
        })
      },
    },
    vue(),
    vueDevTools(),
    themesPlugin(),
  ],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
