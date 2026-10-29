/**
 * Cliente HTTP compartido (axios) para hablar con el backend `TIL_Backend`.
 *
 * Es la ÚNICA instancia de axios de la app: cualquier servicio de feature
 * (p. ej. `monitorService`) la importa en lugar de crear la suya, de modo que
 * la URL base, el timeout y la política de errores viven en un solo lugar.
 */
import axios from 'axios'

/** URL de producción: valor seguro por defecto si `VITE_API_URL` no está definida. */
const PRODUCTION_API_URL = 'https://til-backend.onrender.com/api/v1'

const httpClient = axios.create({
  // `VITE_API_URL` la inyecta Vite desde `.env.development` / `.env.production`
  // según el modo. Si faltara, se usa producción: es preferible a que las
  // peticiones apunten silenciosamente a "nada" o a un localhost inexistente.
  baseURL: import.meta.env.VITE_API_URL || PRODUCTION_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  // Todo lo que sea < 500 se RESUELVE (no lanza): 400 = llave rechazada,
  // 429 = rate limit. Así los llamadores ramifican por `response.status` sin
  // try/catch. Un rechazo real de la promesa significa fallo de red/servidor.
  validateStatus: (status) => status < 500,
})

export default httpClient
