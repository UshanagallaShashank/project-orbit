import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// WHAT: Vite build config — fast HMR in dev, optimized bundle for Firebase deploy
// WHY:  Vite is faster than CRA. No ejecting needed. Works with Tailwind out of the box.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
})
