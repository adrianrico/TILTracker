// man_events is a flat array serialized in groups of 4:
// [time, location, status, percentage, time, location, status, percentage, ...]
export function parseEvents(arr) {
  if (!arr?.length) return []
  const groups = []
  for (let i = 0; i + 3 < arr.length; i += 4) {
    groups.push({ time: arr[i], location: arr[i + 1], status: arr[i + 2], percentage: arr[i + 3] })
  }
  return groups.reverse()
}

// Canonical backend statuses: 'SIN INICIAR' (not started), 'CANCELADO', and
// everything else (EN PROCESO / EN TRÁNSITO / EN TERMINAL / FINALIZADO / ...)
// counts as already started...
export function maneuverStatusBucket(status) {
  const s = (status || '').toUpperCase()
  if (s === 'CANCELADO') return 'cancelled'
  if (s === 'SIN INICIAR' || !s) return 'pending'
  return 'started'
}

export function summarizeManeuvers(maneuvers) {
  return maneuvers.reduce(
    (acc, m) => {
      acc[maneuverStatusBucket(m.man_current_status)] += 1
      return acc
    },
    { started: 0, pending: 0, cancelled: 0 }
  )
}

export function statusColor(status) {
  if (!status) return 'default'
  const s = status.toLowerCase()
  if (s.includes('inici')) return 'orange'
  if (s.includes('proceso') || s.includes('activ') || s.includes('tránsit') || s.includes('transit') || s.includes('terminal')) return 'green'
  if (s.includes('complet') || s.includes('finaliz')) return 'blue'
  if (s.includes('cancel')) return 'red'
  return 'default'
}

export function parseProgress(progress) {
  const n = parseInt(progress, 10)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0
}

// Progress derived from the timeline: percentage of the most recent event
// (parseEvents reverses the array, so index 0 is the latest). Falls back to
// man_progress for legacy records that predate event-based tracking and have
// no man_events yet. A cancelled maniobra always reads 0%, regardless of how
// far it got before being cancelled.
export function timelineProgress(maneuver) {
  if (maneuverStatusBucket(maneuver?.man_current_status) === 'cancelled') return 0
  const parsed = parseEvents(maneuver?.man_events)
  if (parsed.length) return parseProgress(parsed[0].percentage)
  return parseProgress(maneuver?.man_progress)
}

export function isPending(value) {
  return !value || value === 'PENDIENTE'
}

export function getContainerIds(maneuver) {
  return (maneuver.man_containers ?? [])
    .map((c) => c.container_id)
    .filter(Boolean)
}

export function matchesDispatchDate(maneuver, dateValue) {
  if (!dateValue) return true
  return maneuver.man_dispatch_date === dateValue
}

// OR match: a maneuver matches if ANY of the searched container IDs belongs
// to it — lets a user paste IDs from several different maniobras at once and
// see the union of matches...
export function matchesContainerIds(maneuver, containerIds) {
  if (!containerIds?.length) return false
  const ownIds = getContainerIds(maneuver).map((id) => id.toLowerCase())
  return containerIds.some((id) => ownIds.includes(id.toLowerCase()))
}

// Partial/live match against whatever the user is currently typing, before
// they commit it as a chip — lets results narrow down as each keystroke lands.
// Maniobras with zero containers show 'Sin contenedores' in the card, so a
// query like 'sin' must match those too instead of being invisible to search.
export function matchesContainerQuery(maneuver, query) {
  if (!query) return false
  const q = query.trim().toLowerCase()
  if (!q) return false
  const ownIds = getContainerIds(maneuver)
  if (ownIds.length === 0) return 'sin contenedores'.includes(q)
  return ownIds.some((id) => id.toLowerCase().includes(q))
}

export function matchesTransporterQuery(maneuver, query) {
  if (!query) return false
  const q = query.trim().toLowerCase()
  if (!q) return false
  return (maneuver.man_transporter || '').toLowerCase().includes(q)
}

export function filterManeuvers(maneuvers, { dispatchDate, containerIds, containerQuery }) {
  const hasContainerFilter = (containerIds?.length ?? 0) > 0 || !!containerQuery?.trim()
  return maneuvers.filter((m) => {
    if (!matchesDispatchDate(m, dispatchDate)) return false
    if (!hasContainerFilter) return true
    return (
      matchesContainerIds(m, containerIds) ||
      matchesContainerQuery(m, containerQuery) ||
      matchesTransporterQuery(m, containerQuery)
    )
  })
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

// Maniobras without a real dispatch date (e.g. 'PENDIENTE') always sort to
// the end, regardless of direction...
export function sortByDispatchDate(maneuvers, order) {
  if (!order) return maneuvers

  const withDate = []
  const withoutDate = []
  for (const m of maneuvers) {
    if (ISO_DATE.test(m.man_dispatch_date)) withDate.push(m)
    else withoutDate.push(m)
  }

  withDate.sort((a, b) =>
    order === 'asc'
      ? a.man_dispatch_date.localeCompare(b.man_dispatch_date)
      : b.man_dispatch_date.localeCompare(a.man_dispatch_date)
  )

  return [...withDate, ...withoutDate]
}
