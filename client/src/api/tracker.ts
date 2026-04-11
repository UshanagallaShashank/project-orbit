import client from './client'
import type { TrackerEntry } from '@/types'

export const trackerApi = {
  list: () => client.get<TrackerEntry[]>('/api/tracker'),
  delete: (id: string) => client.delete(`/api/tracker/${id}`),
}
