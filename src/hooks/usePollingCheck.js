import { useEffect, useRef, useState, useCallback } from 'react'

const POLL_INTERVAL = 60 * 1000
const IDLE_THRESHOLD = 10 * 1000
const TICK = 1000
const MODAL_DURATION = 2 * 1000

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'wheel', 'touchstart', 'scroll']

// Polls on a 60s cadence, but any UI interaction inhibits the next poll until
// the user has been idle for 10s straight, so a background refetch never
// interrupts an in-progress interaction. Passing enabled=false (polling
// toggled off by the user) pauses the interval entirely.
export function usePollingCheck(onPoll, { enabled = true } = {}) {
  const [isChecking, setIsChecking] = useState(false)
  const lastActivityRef = useRef(Date.now())
  const lastPollRef = useRef(Date.now())
  const onPollRef = useRef(onPoll)
  onPollRef.current = onPoll

  useEffect(() => {
    function markActivity() {
      lastActivityRef.current = Date.now()
    }
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, markActivity, { passive: true }))
    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, markActivity))
    }
  }, [])

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

  useEffect(() => {
    if (!isChecking) return undefined
    const timeout = setTimeout(() => setIsChecking(false), MODAL_DURATION)
    return () => clearTimeout(timeout)
  }, [isChecking])

  const dismiss = useCallback(() => setIsChecking(false), [])

  return { isChecking, dismiss }
}
