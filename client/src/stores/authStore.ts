// stores/authStore.ts - Auth state
//
// Stores both access_token (short-lived, 1h) and refresh_token (long-lived).
// The axios interceptor in client.ts calls refreshSession() on 401 before
// giving up and redirecting to /login.

import { create } from 'zustand'
import { authApi } from '@/api/auth'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  refreshSession: () => Promise<boolean>
  logout: () => void
}

const storedToken   = localStorage.getItem('orbit_token')
const storedRefresh = localStorage.getItem('orbit_refresh_token')

export const useAuthStore = create<AuthStore>((set, get) => ({
  user:            null,
  token:           storedToken,
  refreshToken:    storedRefresh,
  isAuthenticated: !!storedToken,

  login: async (email, password) => {
    const res = await authApi.login(email, password)
    const { access_token, refresh_token, user } = res.data
    localStorage.setItem('orbit_token', access_token)
    localStorage.setItem('orbit_refresh_token', refresh_token)
    set({ token: access_token, refreshToken: refresh_token, user, isAuthenticated: true })
  },

  register: async (email, password) => {
    const res = await authApi.register(email, password)
    const { access_token, refresh_token, user } = res.data
    localStorage.setItem('orbit_token', access_token)
    localStorage.setItem('orbit_refresh_token', refresh_token)
    set({ token: access_token, refreshToken: refresh_token, user, isAuthenticated: true })
  },

  // Called by the axios interceptor when a 401 is received.
  // Returns true if the token was refreshed successfully, false if the user
  // must log in again.
  refreshSession: async () => {
    const rt = get().refreshToken
    if (!rt) return false
    try {
      const res = await authApi.refresh(rt)
      const { access_token, refresh_token, user } = res.data
      localStorage.setItem('orbit_token', access_token)
      localStorage.setItem('orbit_refresh_token', refresh_token)
      set({ token: access_token, refreshToken: refresh_token, user, isAuthenticated: true })
      return true
    } catch {
      get().logout()
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('orbit_token')
    localStorage.removeItem('orbit_refresh_token')
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false })
  },
}))
