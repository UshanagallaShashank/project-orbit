// components/layout/TopNav.tsx
// Top bar shown on every authenticated page.
// Shows breadcrumb title + sidebar toggle on mobile.

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useLocation } from 'react-router-dom'

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/chat':      'Chat',
  '/tasks':     'Tasks',
  '/tracker':   'Tracker',
  '/memories':  'Memories',
}

export function TopNav() {
  const location = useLocation()
  const title = Object.entries(ROUTE_TITLES).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? 'Orbit'

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      <span className="text-sm font-medium">{title}</span>
    </header>
  )
}
