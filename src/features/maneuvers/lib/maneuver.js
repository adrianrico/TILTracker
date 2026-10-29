/**
 * Lógica de dominio de las maniobras: funciones PURAS (sin React, sin red),
 * por eso son fáciles de probar (ver `maneuver.test.js`).
 *
 * Forma de una maniobra que entrega el backend (campos usados por la UI):
 *   man_id, man_client, man_type, man_modality, man_transporter, man_operator,
 *   man_eco, man_current_status, man_current_location, man_dispatch_date,
 *   man_finish_date, man_load_location, man_unload_location, man_progress,
 *   man_gps_link, man_events (objetos o array plano), man_containers (array de objetos).
 */

// ---------------------------------------------------------------------------
// Eventos y estatus
// ---------------------------------------------------------------------------

/**
 * `man_events` llega en uno de dos formatos; ambos se normalizan igual.
 *  - TIL_Backend: array de objetos
 *    `{ timestamp, location_name, event_name, progress, ... }`.
 *  - Heredado: array plano en grupos de 4
 *    `[hora, ubicación, estatus, porcentaje, hora, ubicación, ...]`.
 * Se invierte para que el índice 0 sea el evento MÁS RECIENTE.
 *
 * @param {Array<string | object> | undefined} arr
 * @returns {Array<{time: string, location: string, status: string, percentage: string}>}
 */
export function parseEvents(arr) {
  if (!arr?.length) return []
  if (typeof arr[0] === 'object' && arr[0] !== null) {
    return arr
      .filter((e) => e && typeof e === 'object')
      .map((e) => ({
        time: String(e.timestamp ?? ''),
        location: String(e.location_name ?? ''),
        status: String(e.event_name ?? ''),
        percentage: String(e.progress ?? ''),
      }))
      .reverse()
  }
  const groups = []
  for (let i = 0; i + 3 < arr.length; i += 4) {
    groups.push({ time: arr[i], location: arr[i + 1], status: arr[i + 2], percentage: arr[i + 3] })
  }
  return groups.reverse()
}

/**
 * Clasifica un estatus del backend en tres cubetas. Estatus canónicos:
 * 'SIN INICIAR', 'CANCELADO' y cualquier otro (EN PROCESO, EN TRÁNSITO,
 * EN TERMINAL, FINALIZADO...) cuenta como ya iniciado.
 *
 * @param {string | undefined} status
 * @returns {'cancelled' | 'pending' | 'started'}
 */
export function maneuverStatusBucket(status) {
  const s = (status || '').toUpperCase()
  if (s === 'CANCELADO') return 'cancelled'
  if (s === 'SIN INICIAR' || !s) return 'pending'
  return 'started'
}

/**
 * Cuenta maniobras por cubeta de estatus (para los contadores del encabezado).
 *
 * @param {Array<object>} maneuvers
 * @returns {{started: number, pending: number, cancelled: number}}
 */
export function summarizeManeuvers(maneuvers) {
  return maneuvers.reduce(
    (acc, m) => {
      acc[maneuverStatusBucket(m.man_current_status)] += 1
      return acc
    },
    { started: 0, pending: 0, cancelled: 0 }
  )
}

/**
 * Elige el color semántico del chip de estatus por coincidencia de texto
 * (tolerante a acentos faltantes: 'tránsit' / 'transit').
 *
 * @param {string | undefined} status
 * @returns {'default' | 'orange' | 'green' | 'blue' | 'red'}
 */
export function statusColor(status) {
  if (!status) return 'default'
  const s = status.toLowerCase()
  if (s.includes('inici')) return 'orange'
  if (s.includes('proceso') || s.includes('activ') || s.includes('tránsit') || s.includes('transit') || s.includes('terminal')) return 'green'
  if (s.includes('complet') || s.includes('finaliz')) return 'blue'
  if (s.includes('cancel')) return 'red'
  return 'default'
}

// ---------------------------------------------------------------------------
// Progreso
// ---------------------------------------------------------------------------

/**
 * Convierte cualquier valor a un entero de 0 a 100 (valores no numéricos -> 0).
 *
 * @param {unknown} progress
 * @returns {number}
 */
export function parseProgress(progress) {
  const n = parseInt(progress, 10)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0
}

/**
 * Progreso mostrado en el anillo: porcentaje del evento más reciente de la
 * línea de tiempo. Si no hay eventos (registros antiguos) usa `man_progress`.
 * Una maniobra cancelada siempre marca 0 %, sin importar cuánto avanzó.
 *
 * @param {object} maneuver
 * @returns {number}
 */
export function timelineProgress(maneuver) {
  if (maneuverStatusBucket(maneuver?.man_current_status) === 'cancelled') return 0
  const parsed = parseEvents(maneuver?.man_events)
  if (parsed.length) return parseProgress(parsed[0].percentage)
  return parseProgress(maneuver?.man_progress)
}

// ---------------------------------------------------------------------------
// Contenedores y filtros
// ---------------------------------------------------------------------------

/**
 * @param {object} maneuver
 * @returns {string[]} IDs de contenedor no vacíos.
 */
export function getContainerIds(maneuver) {
  return (maneuver.man_containers ?? [])
    .map((c) => c.container_id)
    .filter(Boolean)
}

/**
 * Filtro por fecha exacta de despacho (`YYYY-MM-DD`). Sin fecha: todo coincide.
 */
export function matchesDispatchDate(maneuver, dateValue) {
  if (!dateValue) return true
  return maneuver.man_dispatch_date === dateValue
}

/**
 * Coincidencia OR exacta: la maniobra coincide si CUALQUIERA de los IDs
 * buscados le pertenece. Permite pegar IDs de varias maniobras y ver la unión.
 *
 * @param {object} maneuver
 * @param {string[]} containerIds IDs ya confirmados como "chips".
 */
export function matchesContainerIds(maneuver, containerIds) {
  if (!containerIds?.length) return false
  const ownIds = getContainerIds(maneuver).map((id) => id.toLowerCase())
  return containerIds.some((id) => ownIds.includes(id.toLowerCase()))
}

/**
 * Coincidencia parcial "en vivo" con lo que el usuario está escribiendo, antes
 * de confirmarlo como chip. Las maniobras sin contenedores muestran
 * 'Sin contenedores' en la tarjeta, así que una búsqueda como 'sin' también
 * debe encontrarlas.
 */
export function matchesContainerQuery(maneuver, query) {
  if (!query) return false
  const q = query.trim().toLowerCase()
  if (!q) return false
  const ownIds = getContainerIds(maneuver)
  if (ownIds.length === 0) return 'sin contenedores'.includes(q)
  return ownIds.some((id) => id.toLowerCase().includes(q))
}

/** Coincidencia parcial por nombre de transportista. */
export function matchesTransporterQuery(maneuver, query) {
  if (!query) return false
  const q = query.trim().toLowerCase()
  if (!q) return false
  return (maneuver.man_transporter || '').toLowerCase().includes(q)
}

/**
 * Aplica todos los filtros: fecha (AND) y búsqueda de texto/contenedores (OR
 * entre chips, texto parcial y transportista).
 *
 * @param {Array<object>} maneuvers
 * @param {{dispatchDate: string, containerIds: string[], containerQuery: string, status?: '' | 'started' | 'pending' | 'cancelled'}} filters
 *   `status` vacío/omitido = sin filtro por estatus (AND con los demás).
 */
export function filterManeuvers(maneuvers, { dispatchDate, containerIds, containerQuery, status = '' }) {
  const hasContainerFilter = (containerIds?.length ?? 0) > 0 || !!containerQuery?.trim()
  return maneuvers.filter((m) => {
    if (status && maneuverStatusBucket(m.man_current_status) !== status) return false
    if (!matchesDispatchDate(m, dispatchDate)) return false
    if (!hasContainerFilter) return true
    return (
      matchesContainerIds(m, containerIds) ||
      matchesContainerQuery(m, containerQuery) ||
      matchesTransporterQuery(m, containerQuery)
    )
  })
}

// ---------------------------------------------------------------------------
// Ordenamiento
// ---------------------------------------------------------------------------

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Ordena por fecha de despacho. Las maniobras sin fecha real (p. ej.
 * 'PENDIENTE') van siempre al final, en cualquier dirección. No muta el
 * array original de entrada cuando hay orden.
 *
 * @param {Array<object>} maneuvers
 * @param {'asc' | 'desc' | '' | null} order Sin orden devuelve la entrada intacta.
 */
export function sortByDispatchDate(maneuvers, order) {
  if (!order) return maneuvers

  const withDate = []
  const withoutDate = []
  for (const m of maneuvers) {
    if (ISO_DATE.test(m.man_dispatch_date)) withDate.push(m)
    else withoutDate.push(m)
  }

  // Las fechas ISO se ordenan correctamente como texto.
  withDate.sort((a, b) =>
    order === 'asc'
      ? a.man_dispatch_date.localeCompare(b.man_dispatch_date)
      : b.man_dispatch_date.localeCompare(a.man_dispatch_date)
  )

  return [...withDate, ...withoutDate]
}
