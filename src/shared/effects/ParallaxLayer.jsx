import { useEffect, useRef } from 'react'
import { subscribeScroll, prefersReducedMotion } from '@/shared/lib/animations'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

/**
 * Capa decorativa de fondo que se desplaza a distinta velocidad que el scroll
 * (efecto parallax). Solo se monta en escritorio y si el usuario no pidió
 * reducir el movimiento.
 *
 * @param {object} props
 * @param {number} [props.speed=0.2] Factor de velocidad; negativo invierte el sentido.
 * @param {string} [props.className] Clase CSS extra (define forma/color de la capa).
 */
export default function ParallaxLayer({ speed = 0.2, className = '' }) {
  const ref = useRef(null)
  const isDesktop = useIsDesktop()

  useEffect(() => {
    const el = ref.current
    if (!el || !isDesktop || prefersReducedMotion()) return

    // Se escribe `transform` directo en el nodo (sin setState) para no
    // re-renderizar React 60 veces por segundo.
    return subscribeScroll((scrollY) => {
      el.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`
    })
  }, [isDesktop, speed])

  if (!isDesktop) return null

  return <div ref={ref} className={`parallax-layer ${className}`} aria-hidden="true" />
}
