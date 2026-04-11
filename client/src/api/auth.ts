import client from './client'
import type { User } from '@/types'

interface AuthResponse {
  access_token: string
  user: User
}

export const authApi = {
  register: (email: string, password: string) =>
    client.post<AuthResponse>('/api/auth/register', { email, password }),

  login: (email: string, password: string) =>
    client.post<AuthResponse>('/api/auth/login', { email, password }),
}
