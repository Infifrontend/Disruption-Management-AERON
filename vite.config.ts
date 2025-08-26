import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    base: env.VITE_FRONTEND_BASE_URL || "/",
    plugins: [react()],
    build: {
      target: 'es2015',
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        onwarn(warning, warn) {
          // Skip various warnings during build
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
          if (warning.code === 'CIRCULAR_DEPENDENCY') return;
          if (warning.code === 'THIS_IS_UNDEFINED') return;
          if (warning.code === 'EVAL') return;
          if (warning.message.includes('Use of eval')) return;
          if (warning.message.includes('Circular dependency')) return;
          warn(warning);
        },
        external: [],
        output: {
          manualChunks: undefined,
        }
      },
      chunkSizeWarningLimit: 1000,
      emptyOutDir: true
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/components": path.resolve(__dirname, "./src/components"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: parseInt(env.VITE_FRONT_PORT) || 5000,
      allowedHosts: true,
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
