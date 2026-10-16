import { useEffect, useState } from 'react'

/** Breakpoint a partir del cual se considera "escritorio" (efectos pesados activos). */
const DESKTOP_QUERY = '(min-width: 1024px)'

/**
 * Hook reactivo sobre `matchMedia`: devuelve `true` si el viewport es de
 * escritorio y se actualiza al redimensionar la ventana.
 *
 * Se usa para decidir si montar efectos costosos (parallax, partículas Three.js).
 *
 * @returns {boolean}
 */
export function useIsDesktop() {
  // Inicializador perezoso: se evalúa solo en el primer render y evita un
  // parpadeo (render móvil -> render escritorio).
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY)
    const handleChange = (event) => setIsDesktop(event.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isDesktop
}
