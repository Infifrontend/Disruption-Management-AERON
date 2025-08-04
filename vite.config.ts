import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      '7c667753-a26a-4da1-8125-d0e750220a0f-00-2ndnr5knhfyg8.sisko.replit.dev',
      '.replit.dev'
    ],
    hmr: {
      port: 5173,
      clientPort: 443,
      overlay: false
    },
    watch: {
      usePolling: true,
      interval: 1000,
      useFsEvents: false,
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    cors: true,
    strictPort: false,
    force: true
  },
  optimizeDeps: {
    exclude: ['fsevents']
  }
})