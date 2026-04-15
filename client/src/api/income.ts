import client from './client'
import type { IncomeEntry, IncomeSummary } from '@/types'

export const incomeApi = {
  list:    (month?: string) =>
    client.get<IncomeEntry[]>('/api/income', { params: month ? { month } : {} }),

  summary: (month?: string) =>
    client.get<IncomeSummary>('/api/income/summary', { params: month ? { month } : {} }),

  delete:  (id: string) =>
    client.delete(`/api/income/${id}`),
}
