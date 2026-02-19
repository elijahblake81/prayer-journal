import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages: use your repo name as base (e.g. /prayer-journal/)
// For custom domain or root: use '/'
export default defineConfig({
  plugins: [react()],
  base: '/prayer-journal/',
})
