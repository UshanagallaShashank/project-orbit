import client from './client'

export interface UploadedDoc {
  id: string
  filename: string
  size_bytes: number
  preview: string
  created_at: string
}

export const uploadApi = {
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return client.post<UploadedDoc>('/api/upload', form)
  },
  list: () => client.get<UploadedDoc[]>('/api/upload'),
  delete: (id: string) => client.delete(`/api/upload/${id}`),
}
