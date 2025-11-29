import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all /api requests to the backend server
      '/api': {
        target: 'http://localhost:3001', // Your backend's port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
