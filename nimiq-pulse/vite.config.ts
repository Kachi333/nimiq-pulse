import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    // Bind all interfaces so Nimiq Pay on a phone can reach the dev server.
    host: true,
  },
})
