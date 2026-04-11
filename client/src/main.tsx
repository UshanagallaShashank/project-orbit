// main.tsx - App entry point
// Wraps the app in ThemeProvider (next-themes) and mounts Toaster (sonner).

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
      <Toaster richColors closeButton />
    </ThemeProvider>
  </StrictMode>,
)
