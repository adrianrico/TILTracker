/**
 * Valida que el enlace GPS de una maniobra sea seguro de cargar.
 *
 * Solo se aceptan URLs `http(s)`: se descartan `javascript:`, `data:`, etc.
 * (el valor viene del backend y se usa como `src` de una imagen) y el
 * marcador `PENDIENTE` que el backend usa cuando aún no hay enlace.
 *
 * @param {unknown} link
 * @returns {boolean}
 */
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
