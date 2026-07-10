import { useEffect, useRef, useState } from 'react'
import { expandReveal } from '../utils/animations'

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="4 4 20 4 14 12 14 19 10 21 10 12 4 4" />
    </svg>
  )
}

function SortDescendingIcon() {
  return (
    <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true">
      <path d="M839.6 433.8L749 150.5a9.24 9.24 0 00-8.9-6.5h-77.4c-4.1 0-7.6 2.6-8.9 6.5l-91.3 283.3c-.3.9-.5 1.9-.5 2.9 0 5.1 4.2 9.3 9.3 9.3h56.4c4.2 0 7.8-2.8 9-6.8l17.5-61.6h89l17.3 61.5c1.1 4 4.8 6.8 9 6.8h61.2c1 0 1.9-.1 2.8-.4 2.4-.8 4.3-2.4 5.5-4.6 1.1-2.2 1.3-4.7.6-7.1zM663.3 325.5l32.8-116.9h6.3l32.1 116.9h-71.2zm143.5 492.9H677.2v-.4l132.6-188.9c1.1-1.6 1.7-3.4 1.7-5.4v-36.4c0-5.1-4.2-9.3-9.3-9.3h-204c-5.1 0-9.3 4.2-9.3 9.3v43c0 5.1 4.2 9.3 9.3 9.3h122.6v.4L587.7 828.9a9.35 9.35 0 00-1.7 5.4v36.4c0 5.1 4.2 9.3 9.3 9.3h211.4c5.1 0 9.3-4.2 9.3-9.3v-43a9.2 9.2 0 00-9.2-9.3zM310.3 167.1a8 8 0 00-12.6 0L185.7 309c-4.2 5.3-.4 13 6.3 13h76v530c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V322h76c6.7 0 10.5-7.8 6.3-13l-112-141.9z" />
    </svg>
  )
}

function splitIds(raw) {
  return raw
    .split(/[,\s]+/)
    .map((id) => id.trim())
    .filter(Boolean)
}

export default function ManeuverFilters({
  dispatchDate,
  onDispatchDateChange,
  containerIds,
  onAddContainerIds,
  onRemoveContainerId,
  containerQuery,
  onContainerQueryChange,
  sortOrder,
  onSortOrderChange,
  onClear,
  resultCount,
  totalCount,
}) {
  const [expanded, setExpanded] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    if (expanded) expandReveal(bodyRef.current)
  }, [expanded])

  function commitContainerInput() {
    const ids = splitIds(containerQuery)
    if (ids.length > 0) onAddContainerIds(ids)
    onContainerQueryChange('')
  }

  function handleContainerKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitContainerInput()
    }
  }

  const hasActiveFilters = !!dispatchDate || containerIds.length > 0 || !!containerQuery
  const activeCount = (dispatchDate ? 1 : 0) + containerIds.length + (containerQuery ? 1 : 0)
  const isAscending = sortOrder === 'asc'

  return (
    <div className="maneuver-filters glass">
      <button
        type="button"
        className="maneuver-filters__toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <FilterIcon />
        <span>Filtros</span>
        {activeCount > 0 && <span className="maneuver-filters__badge">{activeCount}</span>}
        <span className={`maneuver-filters__chevron ${expanded ? 'maneuver-filters__chevron--open' : ''}`}>
          ▾
        </span>
      </button>

      {expanded && (
        <div className="maneuver-filters__body" ref={bodyRef}>
          <div className="maneuver-filters__row">
            <label className="maneuver-filters__field">
              <span className="maneuver-filters__label">Fecha de despacho</span>
              <input
                type="date"
                className="neumo-inset maneuver-filters__date"
                value={dispatchDate}
                onChange={(e) => onDispatchDateChange(e.target.value)}
              />
            </label>

            <label className="maneuver-filters__field maneuver-filters__field--grow">
              <span className="maneuver-filters__label">Buscar por contenedor o transportista</span>
              <input
                type="text"
                className="neumo-inset maneuver-filters__container-input"
                placeholder="ID de contenedor, transportista o 'sin contenedores'; Enter para guardar varios IDs"
                value={containerQuery}
                onChange={(e) => onContainerQueryChange(e.target.value)}
                onKeyDown={handleContainerKeyDown}
                onBlur={commitContainerInput}
              />
            </label>

            <button
              type="button"
              className="neumo-button maneuver-filters__sort-toggle"
              onClick={() => onSortOrderChange(isAscending ? 'desc' : 'asc')}
              aria-label={isAscending ? 'Ordenado por fecha de despacho: más antiguo primero' : 'Ordenado por fecha de despacho: más reciente primero'}
            >
              <span className={`maneuver-filters__sort-icon ${isAscending ? 'maneuver-filters__sort-icon--asc' : ''}`}>
                <SortDescendingIcon />
              </span>
              <span>{isAscending ? 'Más antiguos primero' : 'Más recientes primero'}</span>
            </button>

            {hasActiveFilters && (
              <button type="button" className="neumo-button maneuver-filters__clear" onClick={onClear}>
                Limpiar filtros
              </button>
            )}
          </div>

          {containerIds.length > 0 && (
            <div className="maneuver-filters__chips">
              {containerIds.map((id) => (
                <span key={id} className="maneuver-filters__chip">
                  {id}
                  <button
                    type="button"
                    className="maneuver-filters__chip-remove"
                    aria-label={`Quitar ${id}`}
                    onClick={() => onRemoveContainerId(id)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {hasActiveFilters && (
            <p className="maneuver-filters__count">
              Mostrando {resultCount} de {totalCount} {totalCount === 1 ? 'maniobra' : 'maniobras'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
