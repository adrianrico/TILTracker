import { useEffect, useRef } from 'react'
import { subscribeScroll, prefersReducedMotion } from '../utils/animations'
import { useIsDesktop } from '../hooks/useIsDesktop'

export default function ParallaxLayer({ speed = 0.2, className = '' }) {
  const ref = useRef(null)
  const isDesktop = useIsDesktop()

  useEffect(() => {
    const el = ref.current
    if (!el || !isDesktop || prefersReducedMotion()) return

    return subscribeScroll((scrollY) => {
      el.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`
    })
  }, [isDesktop, speed])

  if (!isDesktop) return null

  return <div ref={ref} className={`parallax-layer ${className}`} aria-hidden="true" />
}
