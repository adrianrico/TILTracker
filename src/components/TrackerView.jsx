export default function TrackerView({
  maneuvers,
  isLoading,
  isRateLimited,
  isNetworkError,
  onRetry,
  onChangeKey,
}) {
  return (
    <div className="tracker-view">
      <header className="tracker-view__header">
        <h1>TIL TRACKER</h1>
        <button onClick={onChangeKey}>Cambiar llave</button>
      </header>

      {isNetworkError && (
        <div className="tracker-view__state">
          <p>Sin conexión con el servidor.</p>
          <button onClick={onRetry}>Reintentar</button>
        </div>
      )}

      {isRateLimited && (
        <div className="tracker-view__state">
          <p>Demasiadas solicitudes, intenta de nuevo en un momento.</p>
        </div>
      )}

      {isLoading && <p>Cargando maniobras…</p>}

      {!isLoading && !isNetworkError && maneuvers.length === 0 && (
        <p className="tracker-view__empty">No hay maniobras activas.</p>
      )}

      <ul className="tracker-view__list">
        {maneuvers.map((m) => (
          <li key={m.man_id}>
            {m.man_id} — {m.man_current_status} — {m.man_progress}
          </li>
        ))}
      </ul>
    </div>
  )
}
