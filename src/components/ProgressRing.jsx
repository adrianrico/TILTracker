import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { parseProgress } from '../utils/maneuver'

const SIZE = 64
const STROKE = 6
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function ProgressRing({ progress, cancelled = false }) {
  const target = parseProgress(progress)
  const circleRef = useRef(null)
  const labelRef = useRef(null)
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const circle = circleRef.current
    const label = labelRef.current
    if (!circle || !label) return

    if (prefersReducedMotion.current) {
      circle.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - target / 100))
      label.textContent = `${target}%`
      return
    }

    const state = { value: 0 }
    const anim = animate(state, {
      value: target,
      duration: 900,
      easing: 'easeOutCubic',
      onRender: () => {
        circle.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - state.value / 100))
        label.textContent = `${Math.round(state.value)}%`
      },
    })

    return () => anim.pause()
  }, [target])

  return (
    <div
      className={`progress-ring neumo ${cancelled ? 'progress-ring--cancelled' : ''}`}
      style={{ width: SIZE, height: SIZE }}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          className="progress-ring__track"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
        />
        <circle
          ref={circleRef}
          className="progress-ring__fill"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </svg>
      <span ref={labelRef} className="progress-ring__label">0%</span>
    </div>
  )
}
