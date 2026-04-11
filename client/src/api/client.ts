// api/client.ts - Axios instance with auth interceptors
//
// Single axios instance used by all api modules.
// Attaches JWT from localStorage on every request.
// On 401, clears token and redirects to login.

import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token before every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('orbit_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, clear auth and redirect to login
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('orbit_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default client
