import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Le nom de ton dépôt GitHub entouré de slashs
  base: '/Life-Tracker/',
})