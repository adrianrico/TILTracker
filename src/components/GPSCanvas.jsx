import { useEffect, useRef } from 'react'
import { isSafeGpsLink } from '../utils/security'

function drawUnavailable(ctx, w, h) {
  ctx.clearRect(0, 0, w, h)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)'
  ctx.lineWidth = 1
  const step = 24
  for (let x = 0; x < w; x += step) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(226, 232, 240, 0.55)'
  ctx.font = '600 14px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('MAPA NO DISPONIBLE', w / 2, h / 2)
}

function drawRadar(ctx, w, h, angle) {
  ctx.clearRect(0, 0, w, h)
  const cx = w / 2
  const cy = h / 2
  const maxR = Math.min(w, h) / 2 - 6

  ctx.strokeStyle = 'rgba(94, 234, 212, 0.35)'
  ctx.lineWidth = 1
  for (let r = maxR / 3; r <= maxR; r += maxR / 3) {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  const gradient = ctx.createConicGradient(angle, cx, cy)
  gradient.addColorStop(0, 'rgba(94, 234, 212, 0.45)')
  gradient.addColorStop(0.15, 'rgba(94, 234, 212, 0)')
  gradient.addColorStop(1, 'rgba(94, 234, 212, 0)')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.arc(cx, cy, maxR, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#5eead4'
  ctx.beginPath()
  ctx.arc(cx, cy, 3, 0, Math.PI * 2)
  ctx.fill()
}

export default function GPSCanvas({ gpsLink }) {
  const canvasRef = useRef(null)
  const isSafe = isSafeGpsLink(gpsLink)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let angle = 0
    let frameId = null

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      render()
    }

    function render() {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (isSafe) {
        drawRadar(ctx, w, h, angle)
      } else {
        drawUnavailable(ctx, w, h)
      }
    }

    function loop() {
      angle += 0.02
      render()
      if (!document.hidden) frameId = requestAnimationFrame(loop)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    function handleVisibility() {
      if (document.hidden) {
        if (frameId) cancelAnimationFrame(frameId)
        frameId = null
      } else if (isSafe && !prefersReducedMotion && !frameId) {
        frameId = requestAnimationFrame(loop)
      }
    }

    if (isSafe && !prefersReducedMotion) {
      frameId = requestAnimationFrame(loop)
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (frameId) cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [isSafe])

  function handleOpenGps() {
    window.open(gpsLink, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="gps-canvas glass">
      <canvas ref={canvasRef} className="gps-canvas__surface" />
      {isSafe && (
        <button className="gps-canvas__button neumo-button" onClick={handleOpenGps}>
          Abrir GPS en vivo
        </button>
      )}
    </div>
  )
}
