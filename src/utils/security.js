const KEY_FORMAT = /^[A-Za-z0-9_-]{4,100}$/

export function isValidKeyFormat(key) {
  return typeof key === 'string' && KEY_FORMAT.test(key)
}

export function isSafeGpsLink(link) {
  if (typeof link !== 'string' || link.trim() === '') return false
  if (link.toUpperCase() === 'PENDIENTE') return false

  try {
    const url = new URL(link)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
