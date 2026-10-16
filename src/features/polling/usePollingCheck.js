import { useEffect, useRef, useState } from 'react'

/** Cada cuánto se intenta refrescar los datos. */
const POLL_INTERVAL = 60 * 1000
/** Tiempo sin interacción del usuario requerido antes de permitir un refresco. */
const IDLE_THRESHOLD = 10 * 1000
/** Frecuencia con que se evalúan las condiciones anteriores. */
const TICK = 1000
/** Cuánto permanece visible el aviso "Revisando si hay cambios". */
const MODAL_DURATION = 2 * 1000

/** Eventos que cuentan como "el usuario está activo". */
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'wheel', 'touchstart', 'scroll']

/**
 * Refresco periódico "respetuoso": consulta cada 60 s, pero SOLO si el usuario
 * lleva al menos 10 s sin interactuar, para que una actualización en segundo
 * plano nunca interrumpa lo que está haciendo (escribir un filtro, leer una
 * tarjeta...).
 *
 * @param {() => void} onPoll Función a ejecutar en cada ciclo (p. ej. `refetch`).
 * @param {object} [options]
 * @param {boolean} [options.enabled=true] `false` pausa el intervalo por completo.
 * @returns {{ isChecking: boolean }} `true` ~2 s tras cada sondeo (para mostrar el aviso).
 */
export function usePollingCheck(onPoll, { enabled = true } = {}) {
  const [isChecking, setIsChecking] = useState(false)

  // Refs en vez de estado: se actualizan muy seguido y NO deben provocar renders.
  const lastActivityRef = useRef(Date.now())
  const lastPollRef = useRef(Date.now())
  // "Latest ref": el intervalo siempre llama a la versión más reciente de
  // `onPoll` sin tener que reiniciarse cuando esta cambia de identidad.
  const onPollRef = useRef(onPoll)
  onPollRef.current = onPoll

  // 1) Registrar actividad del usuario.
  useEffect(() => {
    function markActivity() {
      lastActivityRef.current = Date.now()
    }
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, markActivity, { passive: true }))
    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, markActivity))
    }
  }, [])

  // 2) Reloj de 1 s que decide si toca sondear.
  useEffect(() => {
    if (!enabled) return undefined

    const timer = setInterval(() => {
      const now = Date.now()
      const idleFor = now - lastActivityRef.current
      const sinceLastPoll = now - lastPollRef.current

      if (sinceLastPoll >= POLL_INTERVAL && idleFor >= IDLE_THRESHOLD) {
        lastPollRef.current = now
        setIsChecking(true)
        onPollRef.current?.()
      }
    }, TICK)

    return () => clearInterval(timer)
  }, [enabled])

  // 3) Ocultar el aviso tras MODAL_DURATION.
  useEffect(() => {
    if (!isChecking) return undefined
    const timeout = setTimeout(() => setIsChecking(false), MODAL_DURATION)
    return () => clearTimeout(timeout)
  }, [isChecking])

  return { isChecking }
}
