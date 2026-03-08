import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // @react-three must stay with React to avoid initialization order issues
            if (id.includes('@react-three')) {
              return 'vendor';
            }
            if (id.includes('three') || id.includes('skinview3d')) {
              return 'three-vendor';
            }
            if (id.includes('react-pdf') || id.includes('pdfjs-dist')) {
              return 'pdf-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
