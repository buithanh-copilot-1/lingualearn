import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set VITE_BASE_PATH=/lingualearn/ when deploying to GitHub Pages project site
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react()],
  preview: {
    // Ensure preview server handles client-side routes on refresh
    host: true,
  },
  server: {
    host: true,
  },
})
