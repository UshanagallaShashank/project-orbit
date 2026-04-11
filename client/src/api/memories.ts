import client from './client'
import type { Memory } from '@/types'

export const memoriesApi = {
  list: () => client.get<Memory[]>('/api/memories'),
  delete: (id: string) => client.delete(`/api/memories/${id}`),
}
