import { useState } from 'react'

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
  onClear,
  resultCount,
  totalCount,
}) {
  const [containerInput, setContainerInput] = useState('')

  function commitContainerInput() {
    const ids = splitIds(containerInput)
    if (ids.length > 0) onAddContainerIds(ids)
    setContainerInput('')
  }

  function handleContainerKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitContainerInput()
    }
  }

  const hasActiveFilters = !!dispatchDate || containerIds.length > 0

  return (
    <div className="maneuver-filters glass">
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
          <span className="maneuver-filters__label">Buscar por ID de contenedor</span>
          <input
            type="text"
            className="neumo-inset maneuver-filters__container-input"
            placeholder="Escribe un ID y presiona Enter (puedes agregar varios)"
            value={containerInput}
            onChange={(e) => setContainerInput(e.target.value)}
            onKeyDown={handleContainerKeyDown}
            onBlur={commitContainerInput}
          />
        </label>

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
  )
}
