import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  build: {
    outDir: 'dist',
    sourcemap: false,
  },

  server: {
    port: 3000,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'wicketvickyweb-production.up.railway.app',
      '*.up.railway.app',
      '*.railway.app',
    ],
    // Enable for development
    hmr: {
      host: 'localhost',
      port: 5173,
    }
  }
})