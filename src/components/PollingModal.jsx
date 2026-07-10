export default function PollingModal({ open, message = 'Revisando si hay cambios' }) {
  if (!open) return null

  return (
    <div className="polling-modal" role="status" aria-live="polite">
      <div className="polling-modal__card glass neumo">
        <span className="polling-modal__spinner" aria-hidden="true" />
        <p className="polling-modal__text">{message}</p>
      </div>
    </div>
  )
}
