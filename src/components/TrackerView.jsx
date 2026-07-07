import { useEffect, useRef } from 'react'
import ManeuverCard from './ManeuverCard'
import { staggerFadeIn } from '../utils/animations'

export default function TrackerView({
  maneuvers,
  isLoading,
  isRateLimited,
  isNetworkError,
  onRetry,
  onChangeKey,
}) {
  const clientName = maneuvers[0]?.man_client
  const gridRef = useRef(null)
  const hasAnimatedRef = useRef(false)

  // Stagger-in the cards once, the first time data arrives — background
  // refetches every 60s must not replay the entrance animation...
  useEffect(() => {
    if (!hasAnimatedRef.current && maneuvers.length > 0 && gridRef.current) {
      hasAnimatedRef.current = true
      staggerFadeIn(gridRef.current.children)
    }
  }, [maneuvers])

  return (
    <div className="tracker-view">
      <header className="tracker-view__header glass">
        <div>
          <h1 className="tracker-view__title">TIL TRACKER</h1>
          {clientName && <p className="tracker-view__client">{clientName}</p>}
          <p className="tracker-view__count">
            {maneuvers.length} {maneuvers.length === 1 ? 'maniobra' : 'maniobras'}
          </p>
        </div>
        <button className="tracker-view__change-key neumo-button" onClick={onChangeKey}>
          Cambiar llave
        </button>
      </header>

      {isNetworkError && (
        <div className="tracker-view__state glass">
          <p>Sin conexión con el servidor. Tu llave sigue guardada.</p>
          <button className="neumo-button" onClick={onRetry}>Reintentar</button>
        </div>
      )}

      {isRateLimited && (
        <div className="tracker-view__state glass">
          <p>Demasiadas solicitudes, intenta de nuevo en un momento.</p>
        </div>
      )}

      {isLoading && !isNetworkError && (
        <p className="tracker-view__loading">Cargando maniobras…</p>
      )}

      {!isLoading && !isNetworkError && !isRateLimited && maneuvers.length === 0 && (
        <div className="tracker-view__empty glass">
          <p>No hay maniobras activas para esta llave.</p>
        </div>
      )}

      <div className="tracker-view__grid" ref={gridRef}>
        {maneuvers.map((m) => (
          <ManeuverCard key={m.man_id} maneuver={m} />
        ))}
      </div>
    </div>
  )
}
