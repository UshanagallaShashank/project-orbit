import client from './client'
import type { Task } from '@/types'

export const tasksApi = {
  list: () => client.get<Task[]>('/api/tasks'),
  toggle: (id: string, done: boolean) =>
    client.patch<Task>(`/api/tasks/${id}`, { done }),
}
