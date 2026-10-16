/**
 * Utilidades de animación y scroll compartidas por toda la app.
 *
 * - `subscribeScroll`: un único bucle `requestAnimationFrame` para todos los
 *   consumidores (parallax, fondo Three.js), en vez de un bucle por componente.
 * - `staggerFadeIn`, `growIn`, `expandReveal`: animaciones de entrada basadas en anime.js, que respetan
 *   `prefers-reduced-motion` (accesibilidad).
 */
import { animate, remove, set, stagger } from 'animejs'

// ---------------------------------------------------------------------------
// Ticker de scroll compartido
// ---------------------------------------------------------------------------

/** Callbacks suscritos; cada frame reciben `window.scrollY`. */
const scrollSubscribers = new Set()
let rafId = null

function tick() {
  const scrollY = window.scrollY
  for (const callback of scrollSubscribers) callback(scrollY)
  rafId = requestAnimationFrame(tick)
}

function startTicker() {
  if (rafId === null) rafId = requestAnimationFrame(tick)
}

function stopTicker() {
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null
}

// Con la pestaña oculta el navegador ya no pinta: se pausa el bucle para no
// gastar CPU/batería y se reanuda al volver, si aún hay suscriptores.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopTicker()
    else if (scrollSubscribers.size > 0) startTicker()
  })
}

/**
 * Suscribe un callback que se ejecuta en cada frame con la posición de scroll.
 *
 * @param {(scrollY: number) => void} callback
 * @returns {() => void} función para cancelar la suscripción (úsala en el cleanup de `useEffect`).
 */
export function subscribeScroll(callback) {
  scrollSubscribers.add(callback)
  if (!document.hidden) startTicker()
  return () => {
    scrollSubscribers.delete(callback)
    if (scrollSubscribers.size === 0) stopTicker()
  }
}

// ---------------------------------------------------------------------------
// Accesibilidad
// ---------------------------------------------------------------------------

/**
 * @returns {boolean} `true` si el usuario pidió reducir el movimiento en su sistema operativo.
 */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// ---------------------------------------------------------------------------
// Animaciones de entrada
// ---------------------------------------------------------------------------

/**
 * Aparición escalonada (fade + deslizamiento hacia arriba) de una colección de elementos.
 *
 * @param {HTMLCollection | Element[]} elements
 */
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

/**
 * "Crece" un elemento desde escala 0 con rebote (efecto pop-in).
 *
 * @param {HTMLElement | null} el
 */
export function growIn(el) {
  if (!el) return
  remove(el) // cancela animaciones previas sobre el mismo nodo
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

/**
 * Despliega un contenedor animando su altura de 0 a su altura natural.
 * Al terminar restaura `height: auto` para que siga siendo responsivo.
 *
 * @param {HTMLElement | null} el
 */
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
