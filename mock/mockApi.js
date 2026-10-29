/**
 * Plugin de Vite que simula el backend SOLO en modo `mock` (`npm run dev:mock`).
 *
 * Sirve GET /maneuvers/monitor/?key=... con el mismo contrato que
 * `TIL_Backend`, para desarrollar y probar la app completa sin backend:
 *
 *   - key válida (`demo1234`) -> { code: '1', maneuvers_data: [...] }
 *   - key con formato inválido o desconocida -> HTTP 400
 *   - key `limite` -> HTTP 429 (simula rate limit)
 *
 * No forma parte del build de producción (`configureServer` solo existe en dev).
 */

const VALID_KEY = 'demo1234'
const RATE_LIMIT_KEY = 'limite'
const KEY_FORMAT = /^[A-Za-z0-9_-]{4,100}$/

/** `man_events` es un array plano de grupos de 4: hora, ubicación, estatus, %. */
const MANEUVERS = [
  {
    man_id: 'MAN-1001',
    man_client: 'CLIENTE DEMO',
    man_type: 'IMPORTACIÓN',
    man_modality: 'SENCILLO',
    man_transporter: 'TRANSPORTES ACME',
    man_operator: 'J. PÉREZ',
    man_eco: 'ECO-12',
    man_current_status: 'EN TRÁNSITO',
    man_current_location: 'AUTOPISTA MÉXICO-PUEBLA',
    man_dispatch_date: '2026-07-10',
    man_finish_date: 'PENDIENTE',
    man_load_location: 'PUERTO DE VERACRUZ',
    man_unload_location: 'CDMX',
    man_progress: '40',
    man_gps_link: 'PENDIENTE',
    man_events: [
      '2026-07-10 08:00', 'PUERTO DE VERACRUZ', 'EN PROCESO', '10',
      '2026-07-10 12:30', 'CASETA ORIZABA', 'EN TRÁNSITO', '40',
    ],
    man_containers: [
      { container_id: 'MSCU1234567', container_size: '40', container_type: 'HC', container_content: 'ELECTRÓNICOS', container_weight: '18000' },
      { container_id: 'TGHU7654321', container_size: '20', container_type: 'DRY', container_content: 'TEXTIL', container_weight: '12000' },
    ],
  },
  {
    man_id: 'MAN-1002',
    man_client: 'CLIENTE DEMO',
    man_type: 'EXPORTACIÓN',
    man_modality: 'FULL',
    man_transporter: 'PENDIENTE',
    man_operator: 'PENDIENTE',
    man_eco: 'PENDIENTE',
    man_current_status: 'SIN INICIAR',
    man_current_location: 'PENDIENTE',
    man_dispatch_date: 'PENDIENTE',
    man_finish_date: 'PENDIENTE',
    man_load_location: 'PENDIENTE',
    man_unload_location: 'PENDIENTE',
    man_progress: '0',
    man_gps_link: 'PENDIENTE',
    man_events: [],
    man_containers: [],
  },
  {
    man_id: 'MAN-1003',
    man_client: 'CLIENTE DEMO',
    man_type: 'IMPORTACIÓN',
    man_modality: 'SENCILLO',
    man_transporter: 'LOGÍSTICA BETA',
    man_operator: 'M. LÓPEZ',
    man_eco: 'ECO-07',
    man_current_status: 'CANCELADO',
    man_current_location: 'TERMINAL MANZANILLO',
    man_dispatch_date: '2026-06-28',
    man_finish_date: 'PENDIENTE',
    man_load_location: 'MANZANILLO',
    man_unload_location: 'GUADALAJARA',
    man_progress: '60',
    man_gps_link: 'https://javascript.invalid/no-es-imagen',
    man_events: ['2026-06-28 09:00', 'TERMINAL MANZANILLO', 'EN TERMINAL', '60'],
    man_containers: [{ container_id: 'CMAU1112223', container_size: '40', container_type: 'DRY', container_content: '', container_weight: '' }],
  },
]

/** @returns {import('vite').Plugin} */
export default function mockApi() {
  return {
    name: 'til-tracker-mock-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/maneuvers/monitor', (req, res) => {
        const key = new URL(req.url, 'http://localhost').searchParams.get('key') ?? ''
        const send = (status, body) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }

        if (!KEY_FORMAT.test(key)) return send(400, { code: '0' })
        if (key === RATE_LIMIT_KEY) return send(429, { code: '0' })
        if (key !== VALID_KEY) return send(400, { code: '0' })
        return send(200, { code: '1', maneuvers_data: MANEUVERS })
      })
    },
  }
}
