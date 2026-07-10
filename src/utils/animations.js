import { animate, remove, set, stagger } from 'animejs'

// Single shared requestAnimationFrame ticker: every scroll/parallax/three.js
// consumer subscribes here instead of running its own rAF loop, and the
// whole thing pauses automatically when the tab is hidden...
const tickers = new Set()
let rafId = null

function tick() {
  const scrollY = window.scrollY
  for (const callback of tickers) callback(scrollY)
  rafId = requestAnimationFrame(tick)
}

function startTicker() {
  if (rafId === null) rafId = requestAnimationFrame(tick)
}

function stopTicker() {
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopTicker()
    else if (tickers.size > 0) startTicker()
  })
}

export function subscribeScroll(callback) {
  tickers.add(callback)
  if (!document.hidden) startTicker()
  return () => {
    tickers.delete(callback)
    if (tickers.size === 0) stopTicker()
  }
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Fires once when `el` enters the viewport, then disconnects...
export function onEnterView(el, callback, options = { threshold: 0.15 }) {
  if (!el) return () => {}
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        callback(entry.target)
        observer.unobserve(entry.target)
      }
    }
  }, options)
  observer.observe(el)
  return () => observer.disconnect()
}

export function staggerFadeIn(elements) {
  if (prefersReducedMotion() || !elements || (elements.length ?? 0) === 0) return
  return animate(elements, {
    opacity: [0, 1],
    translateY: [18, 0],
    delay: stagger(70),
    duration: 480,
    ease: 'outQuad',
  })
}

export function fadeSlideIn(el) {
  if (!el) return
  if (prefersReducedMotion()) {
    el.style.opacity = 1
    return
  }
  return animate(el, {
    opacity: [0, 1],
    translateY: [10, 0],
    duration: 400,
    ease: 'outQuad',
  })
}

export function growIn(el) {
  if (!el) return
  remove(el)
  if (prefersReducedMotion()) {
    set(el, { scale: 1, opacity: 1 })
    return
  }
  set(el, { scale: 0, opacity: 0 })
  animate(el, {
    scale: [0, 1],
    opacity: [0, 1],
    duration: 420,
    ease: 'outBack',
  })
}

export function expandReveal(el) {
  if (!el) return
  const targetHeight = el.scrollHeight
  if (prefersReducedMotion()) {
    el.style.height = 'auto'
    el.style.opacity = 1
    return
  }
  el.style.height = '0px'
  el.style.opacity = 0
  el.style.overflow = 'hidden'
  animate(el, {
    height: [0, targetHeight],
    opacity: [0, 1],
    duration: 380,
    ease: 'outQuad',
    onComplete: () => {
      el.style.height = 'auto'
      el.style.overflow = 'visible'
    },
  })
}
