/**
 * Punto de entrada de la app: monta React en `#root` (ver `index.html`) y
 * registra los proveedores globales (React Query) y las hojas de estilo.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './app/App.jsx'
import ErrorBoundary from '@/shared/ui/ErrorBoundary'
import './styles/tokens.css'
import './styles/glass.css'
import './styles/neumo.css'
import './styles/layout.css'

// Valores por defecto de toda consulta: 1 reintento ante fallo y datos
// considerados "frescos" 30 s (evita peticiones redundantes).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
)
