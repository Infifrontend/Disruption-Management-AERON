
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
      "b75debbc-e13a-4222-91f0-9e719d73b403-00-3sp3wh6v7hulo.sisko.replit.dev",
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
