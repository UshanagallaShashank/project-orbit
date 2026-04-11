import client from './client'
import type { ChatResponse } from '@/types'

export const chatApi = {
  send: (message: string) =>
    client.post<ChatResponse>('/api/chat', { message }),
}
