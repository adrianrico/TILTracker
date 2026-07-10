import { useEffect, useMemo, useRef, useState } from 'react'
import ActionMenu from './ActionMenu'
import ManeuverCard from './ManeuverCard'
import ManeuverFilters from './ManeuverFilters'
import ManeuverStats from './ManeuverStats'
import PollingStatus from './PollingStatus'
import { staggerFadeIn } from '../utils/animations'
import { filterManeuvers, sortByDispatchDate } from '../utils/maneuver'

export default function TrackerView({
  maneuvers,
  isLoading,
  isFetching,
  isRateLimited,
  isNetworkError,
  onRetry,
  onRefresh,
  onChangeKey,
  pollingEnabled,
  onTogglePolling,
}) {
  const clientName = maneuvers[0]?.man_client
  const listRef = useRef(null)
  const hasAnimatedRef = useRef(false)

  const [dispatchDate, setDispatchDate] = useState('')
  const [containerIds, setContainerIds] = useState([])
  const [containerQuery, setContainerQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')

  const filteredManeuvers = useMemo(() => {
    const filtered = filterManeuvers(maneuvers, { dispatchDate, containerIds, containerQuery })
    return sortByDispatchDate(filtered, sortOrder)
  }, [maneuvers, dispatchDate, containerIds, containerQuery, sortOrder])

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
    setContainerQuery('')
  }

  // Stagger-in the list once, the first time data arrives — background
  // refetches from polling must not replay the entrance animation...
  useEffect(() => {
    if (!hasAnimatedRef.current && maneuvers.length > 0 && listRef.current) {
      hasAnimatedRef.current = true
      staggerFadeIn(listRef.current.children)
    }
  }, [maneuvers])

  return (
    <div className="tracker-view">
      <header className="tracker-view__header glass">
        <h1 className="tracker-view__title">TIL TRACKER</h1>
        {clientName && <p className="tracker-view__client">BIENVENIDO: {clientName}</p>}
        <PollingStatus enabled={pollingEnabled} />
        <ManeuverStats maneuvers={maneuvers} />
        <ActionMenu
          onChangeKey={onChangeKey}
          onRefresh={onRefresh}
          refreshing={isFetching}
          pollingEnabled={pollingEnabled}
          onTogglePolling={onTogglePolling}
        />
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
          containerQuery={containerQuery}
          onContainerQueryChange={setContainerQuery}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
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
