import axios from 'axios'

const api = axios.create({
  // Falls back to the deployed backend so a missing/unset VITE_API_URL never
  // silently resolves to nothing — production is the safe default, not local.
  baseURL: import.meta.env.VITE_API_URL || 'https://maylob-backend.onrender.com',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  // Anything below 500 resolves normally (400 = rejected key, 429 = rate
  // limited) so callers can branch on status without a try/catch — a true
  // reject here means a real network/server failure...
  validateStatus: (status) => status < 500,
})

export default api
