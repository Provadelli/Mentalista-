import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages publica em /<repositório>/; na Vercel fica em /.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  server: { host: true },
})
