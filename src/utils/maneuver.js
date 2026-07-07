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
  if (!containerIds?.length) return true
  const ownIds = getContainerIds(maneuver).map((id) => id.toLowerCase())
  return containerIds.some((id) => ownIds.includes(id.toLowerCase()))
}

export function filterManeuvers(maneuvers, { dispatchDate, containerIds }) {
  return maneuvers.filter(
    (m) => matchesDispatchDate(m, dispatchDate) && matchesContainerIds(m, containerIds)
  )
}
