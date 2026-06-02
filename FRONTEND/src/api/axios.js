import axios from 'axios'

// Vite exposes env vars via import.meta.env (prefix: VITE_)
// The dev server proxy in vite.config.js forwards /api → localhost:5000
// so baseURL '/api' works perfectly in dev without needing the full URL.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
})

// Attach JWT token to every request if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rp_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401 globally — redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rp_token')
      localStorage.removeItem('rp_admin')
      if (
        window.location.pathname.startsWith('/admin') &&
        window.location.pathname !== '/admin/login'
      ) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export default API
