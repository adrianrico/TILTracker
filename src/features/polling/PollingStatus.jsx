/**
 * Indicador (punto + texto) de si la auto-actualización está activa.
 *
 * @param {object} props
 * @param {boolean} props.enabled
 */
export default function PollingStatus({ enabled }) {
  return (
    <p className={`polling-status ${enabled ? 'polling-status--on' : 'polling-status--off'}`}>
      <span className="polling-status__dot" aria-hidden="true" />
      {enabled ? 'Auto-actualización activada cada minuto' : 'Auto-actualización desactivada'}
    </p>
  )
}
