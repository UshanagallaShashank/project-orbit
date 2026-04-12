// components/layout/AppSidebar.tsx

import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  Activity,
  BookMarked,
  Upload,
  Orbit,
  SquarePen,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chat',      label: 'Chat',      icon: MessageSquare  },
  { to: '/tasks',     label: 'Tasks',     icon: CheckSquare    },
  { to: '/tracker',   label: 'Tracker',   icon: Activity       },
  { to: '/memories',  label: 'Memories',  icon: BookMarked     },
  { to: '/upload',    label: 'Documents', icon: Upload         },
]

export function AppSidebar() {
  const location    = useLocation()
  const navigate    = useNavigate()
  const { user, logout } = useAuthStore()
  const clearHistory     = useChatStore((s) => s.clearHistory)

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'OR'

  function handleNewChat() {
    clearHistory()
    navigate('/chat')
    toast.success('New chat started')
  }

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-4">
        {/* Logo row + New Chat button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-1">
            <Orbit className="h-5 w-5" />
            <span className="text-base font-semibold tracking-tight">Orbit</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="New chat"
            onClick={handleNewChat}
          >
            <SquarePen className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = location.pathname.startsWith(to)
            return (
              <SidebarMenuItem key={to}>
                <SidebarMenuButton
                  isActive={active}
                  render={<NavLink to={to} className="flex items-center gap-3" />}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground truncate flex-1">
            {user?.email ?? 'Guest'}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={logout}>
          Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
