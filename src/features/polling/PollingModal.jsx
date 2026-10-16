/**
 * Aviso flotante no bloqueante que indica que se está buscando cambios.
 *
 * @param {object} props
 * @param {boolean} props.open Si es `false` no renderiza nada.
 * @param {string} [props.message]
 */
export default function PollingModal({ open, message = 'Revisando si hay cambios' }) {
  if (!open) return null

  // role="status" + aria-live="polite": lectores de pantalla lo anuncian sin interrumpir.
  return (
    <div className="polling-modal" role="status" aria-live="polite">
      <div className="polling-modal__card glass neumo">
        <span className="polling-modal__spinner" aria-hidden="true" />
        <p className="polling-modal__text">{message}</p>
      </div>
    </div>
  )
}
