// components/layout/TopNav.tsx
// Top bar shown on every authenticated page.
// Shows breadcrumb title + sidebar toggle on mobile.

import { SidebarTrigger } from '@/components/ui/sidebar'
import { useLocation } from 'react-router-dom'

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/chat':      'Chat',
  '/tasks':     'Tasks',
  '/tracker':   'Tracker',
  '/memories':  'Memories',
  '/upload':    'Documents',
}

export function TopNav() {
  const location = useLocation()
  const title = Object.entries(ROUTE_TITLES).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? 'Orbit'

  const date = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date())

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
        Personal AI command center
      </div>
    </header>
  )
}
