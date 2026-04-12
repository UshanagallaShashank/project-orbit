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
  LogOut,
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
  const location     = useLocation()
  const navigate     = useNavigate()
  const { user, logout } = useAuthStore()
  const clearHistory = useChatStore((s) => s.clearHistory)

  // Derive display name from email: "shashank@gmail.com" -> "shashank"
  const username = user?.email?.split('@')[0] ?? 'User'
  const initials = username.slice(0, 2).toUpperCase()

  function handleNewChat() {
    clearHistory()
    navigate('/chat')
    toast.success('New chat started')
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <Sidebar>
      {/* Header: logo + new chat */}
      <SidebarHeader className="px-3 py-4">
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

      {/* Nav links */}
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

      {/* Footer: user info + sign out */}
      <SidebarFooter className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs font-medium bg-muted">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{username}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            title="Sign out"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
