// components/layout/AppLayout.tsx
// Authenticated shell: sidebar + topnav + main content.
//
// Layout contract:
//   SidebarProvider wraps everything in a flex row.
//   SidebarInset is min-h-screen flex flex-col (from shadcn).
//   TopNav is shrink-0 (h-16).
//   <main> gets flex-1 min-h-0 so it fills the remaining height.
//   overflow-y-auto on main allows dashboard/tasks/etc to scroll normally.
//   ChatPage uses h-full which resolves to the main's constrained height
//   (works because min-h-0 + flex-1 give a definite height to children).

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { TopNav } from './TopNav'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNav />
        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
