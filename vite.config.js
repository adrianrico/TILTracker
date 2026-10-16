import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import mockApi from './mock/mockApi.js'

// Configuración de Vite (bundler + servidor de desarrollo) y de Vitest (tests).
// El alias `@` apunta a `src/`, así los imports no dependen de la profundidad
// del archivo: `@/shared/lib/animations` en vez de `../../../shared/lib/animations`.
export default defineConfig(({ mode }) => ({
  // El backend simulado solo se activa con `npm run dev:mock` (mode === 'mock').
  plugins: [react(), ...(mode === 'mock' ? [mockApi()] : [])],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
}))
