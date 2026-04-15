// api/resume.ts — resume PDF and email endpoints

import client from './client'

export const resumeApi = {
  downloadPdf: () =>
    client.get('/api/resume/pdf', { responseType: 'blob' }),

  emailPdf: () =>
    client.post<{ sent: boolean; to: string }>('/api/resume/send-pdf'),
}
