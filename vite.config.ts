import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Every internal Link/NavLink opens in a new tab, per product
      // decision — call sites import from here instead of
      // 'react-router-dom' directly so every file gets that behavior
      // without repeating target="_blank" everywhere. See NewTabLinks.tsx.
      '~links': path.resolve(__dirname, 'src/components/NewTabLinks.tsx'),
    },
  },
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
  build: {
    rollupOptions: {
      output: {
        // Split heavy, rarely-changing vendor libs into their own chunks so
        // an app-code change doesn't force revalidating (and re-downloading)
        // react/framer-motion/leaflet on every deploy, and so the map/form
        // libraries only load on the pages that actually use them.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
})
