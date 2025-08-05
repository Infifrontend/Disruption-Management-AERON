
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: [
      "7c667753-a26a-4da1-8125-d0e750220a0f-00-2ndnr5knhfyg8.sisko.replit.dev",
      "localhost",
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
