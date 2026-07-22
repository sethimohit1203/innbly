import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5183,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8797',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4183,
    strictPort: true,
  },
})
