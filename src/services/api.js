import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  // Anything below 500 resolves normally (400 = rejected key, 429 = rate
  // limited) so callers can branch on status without a try/catch — a true
  // reject here means a real network/server failure...
  validateStatus: (status) => status < 500,
})

export default api
