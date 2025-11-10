import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173, // pour npm run dev
    proxy: {
      // quand tu fais /api/... en local, ça redirige vers le backend vercel dev
      '/api': 'http://localhost:3001',
    },
  },
  build: {
    outDir: 'dist',
  },
})
