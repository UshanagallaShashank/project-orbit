// stores/authStore.ts - Auth state
//
// Persists token to localStorage so the user stays logged in on refresh.
// All components read from here instead of directly from localStorage.

import { create } from 'zustand'
import { authApi } from '@/api/auth'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const stored = localStorage.getItem('orbit_token')

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: stored,
  isAuthenticated: !!stored,

  login: async (email, password) => {
    const res = await authApi.login(email, password)
    const { access_token, user } = res.data
    localStorage.setItem('orbit_token', access_token)
    set({ token: access_token, user, isAuthenticated: true })
  },

  register: async (email, password) => {
    const res = await authApi.register(email, password)
    const { access_token, user } = res.data
    localStorage.setItem('orbit_token', access_token)
    set({ token: access_token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('orbit_token')
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
