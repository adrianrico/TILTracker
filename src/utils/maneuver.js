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
