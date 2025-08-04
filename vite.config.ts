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
    hmr: {
      port: 5173,
      clientPort: 443
    },
    watch: {
      usePolling: false,
      useFsEvents: true
    }
  },
  optimizeDeps: {
    exclude: ['fsevents']
  }
})