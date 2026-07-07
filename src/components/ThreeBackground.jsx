import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { subscribeScroll, prefersReducedMotion } from '../utils/animations'
import { useIsDesktop } from '../hooks/useIsDesktop'

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

export default function ThreeBackground() {
  const containerRef = useRef(null)
  const isDesktop = useIsDesktop()

  useEffect(() => {
    const container = containerRef.current
    if (!container || prefersReducedMotion() || !hasWebGL()) return

    const particleCount = isDesktop ? 260 : 110

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 12

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(renderer.domElement)

    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      size: 0.06,
      color: 0x5eead4,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })
    const points = new THREE.Points(geometry, material)
    scene.add(points)

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize, { passive: true })

    const scrollableHeight = () => Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)

    const unsubscribe = subscribeScroll((scrollY) => {
      const fraction = Math.min(scrollY / scrollableHeight(), 1)
      points.rotation.y += 0.0009
      points.rotation.x = fraction * 0.3
      camera.position.z = 12 - fraction * 2
      material.color.setHSL(0.5 + fraction * 0.1, 0.6, 0.6)
      renderer.render(scene, camera)
    })

    return () => {
      unsubscribe()
      window.removeEventListener('resize', handleResize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [isDesktop])

  return <div ref={containerRef} className="three-background" aria-hidden="true" />
}
