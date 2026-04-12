// api/client.ts - Axios instance with auth + auto-refresh
//
// On 401:
//   1. Try to refresh the access token using the stored refresh_token.
//   2. If refresh succeeds, retry the original request once with the new token.
//   3. If refresh fails (refresh_token also expired), clear auth and go to /login.
//
// This means users stay logged in across the 1-hour access token window
// as long as they use the app at least once every 7 days (Supabase default
// for refresh token expiry).

import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8000',
  // No global Content-Type — set it per request in the interceptor below.
  // FormData (file uploads) requires the browser to auto-generate the header
  // with the multipart boundary; setting it here would break that.
})

// Attach access token + set Content-Type before every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('orbit_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Only set JSON Content-Type for non-file requests
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

// Track whether a refresh is already in-flight so concurrent 401s
// don't all try to refresh at the same time.
let refreshing: Promise<boolean> | null = null

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original: InternalAxiosRequestConfig & { _retried?: boolean } = err.config

    // Only attempt refresh once per request, and only on 401
    if (err.response?.status === 401 && !original._retried) {
      original._retried = true

      // Import lazily to avoid circular dependency (store imports client, client imports store)
      if (!refreshing) {
        const { useAuthStore } = await import('@/stores/authStore')
        refreshing = useAuthStore.getState().refreshSession()
        refreshing.finally(() => { refreshing = null })
      }

      const ok = await refreshing
      if (ok) {
        // Swap in the new token and retry
        original.headers.Authorization = `Bearer ${localStorage.getItem('orbit_token')}`
        return client(original)
      }

      // Refresh failed — redirect to login
      window.location.href = '/login'
    }

    return Promise.reject(err)
  },
)

export default client
