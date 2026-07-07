import { useEffect, useMemo, useRef, useState } from 'react'
import ManeuverCard from './ManeuverCard'
import ManeuverFilters from './ManeuverFilters'
import { staggerFadeIn } from '../utils/animations'
import { filterManeuvers } from '../utils/maneuver'

export default function TrackerView({
  maneuvers,
  isLoading,
  isRateLimited,
  isNetworkError,
  onRetry,
  onChangeKey,
}) {
  const clientName = maneuvers[0]?.man_client
  const listRef = useRef(null)
  const hasAnimatedRef = useRef(false)

  const [dispatchDate, setDispatchDate] = useState('')
  const [containerIds, setContainerIds] = useState([])

  const filteredManeuvers = useMemo(
    () => filterManeuvers(maneuvers, { dispatchDate, containerIds }),
    [maneuvers, dispatchDate, containerIds]
  )

  function handleAddContainerIds(ids) {
    setContainerIds((prev) => {
      const next = new Set(prev.map((id) => id.toLowerCase()))
      const merged = [...prev]
      for (const id of ids) {
        if (!next.has(id.toLowerCase())) {
          next.add(id.toLowerCase())
          merged.push(id)
        }
      }
      return merged
    })
  }

  function handleRemoveContainerId(id) {
    setContainerIds((prev) => prev.filter((existing) => existing !== id))
  }

  function handleClearFilters() {
    setDispatchDate('')
    setContainerIds([])
  }

  // Stagger-in the list once, the first time data arrives — background
  // refetches every 60s must not replay the entrance animation...
  useEffect(() => {
    if (!hasAnimatedRef.current && maneuvers.length > 0 && listRef.current) {
      hasAnimatedRef.current = true
      staggerFadeIn(listRef.current.children)
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

      {!isLoading && !isNetworkError && maneuvers.length > 0 && (
        <ManeuverFilters
          dispatchDate={dispatchDate}
          onDispatchDateChange={setDispatchDate}
          containerIds={containerIds}
          onAddContainerIds={handleAddContainerIds}
          onRemoveContainerId={handleRemoveContainerId}
          onClear={handleClearFilters}
          resultCount={filteredManeuvers.length}
          totalCount={maneuvers.length}
        />
      )}

      {!isLoading && !isNetworkError && maneuvers.length > 0 && filteredManeuvers.length === 0 && (
        <div className="tracker-view__empty glass">
          <p>Ninguna maniobra coincide con los filtros aplicados.</p>
        </div>
      )}

      <div className="tracker-view__list" ref={listRef}>
        {filteredManeuvers.map((m) => (
          <ManeuverCard key={m.man_id} maneuver={m} />
        ))}
      </div>
    </div>
  )
}
