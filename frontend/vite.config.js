import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist'
  },
  preview: {
    port: 3000,
    strictPort: true
  },
  publicDir: 'public'
})