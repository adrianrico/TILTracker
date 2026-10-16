import { useEffect, useRef, useState } from 'react'
import ProgressRing from './ProgressRing'
import StatusChip from './StatusChip'
import ManeuverDetail from './ManeuverDetail'
import { expandReveal } from '@/shared/lib/animations'
import { timelineProgress, maneuverStatusBucket } from '../lib/maneuver'

/**
 * Tarjeta de una maniobra: resumen siempre visible y detalle desplegable.
 * El detalle solo se monta al expandir (carga perezosa de GPS/eventos).
 *
 * @param {object} props
 * @param {object} props.maneuver Maniobra tal como la entrega el backend.
 */
export default function ManeuverCard({ maneuver }) {
  const [expanded, setExpanded] = useState(false)
  const detailRef = useRef(null)
  const containers = maneuver.man_containers ?? []
  const containerIds = containers.map((c) => c.container_id).filter(Boolean)
  const cancelled = maneuverStatusBucket(maneuver.man_current_status) === 'cancelled'

  useEffect(() => {
    if (expanded) expandReveal(detailRef.current)
  }, [expanded])

  return (
    <article className={`maneuver-card glass neumo ${expanded ? 'maneuver-card--expanded' : ''}`}>
      <button
        className="maneuver-card__summary"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="maneuver-card__summary-main">
          <div className="maneuver-card__id-block">
            <span className="maneuver-card__id">{maneuver.man_id}</span>
            <ProgressRing progress={timelineProgress(maneuver)} cancelled={cancelled} />
          </div>

          <div className="maneuver-card__field">
            <span className="maneuver-card__field-label">Núm. de contenedores</span>
            <span className="maneuver-card__field-value">{containers.length}</span>
          </div>

          <div className="maneuver-card__field">
            <span className="maneuver-card__field-label">ID de contenedores</span>
            <span className="maneuver-card__field-value maneuver-card__field-value--list">
              {containerIds.length > 0
                ? containerIds.map((id) => <span key={id}>{id}</span>)
                : 'Sin contenedores'}
            </span>
          </div>

          <div className="maneuver-card__field">
            <span className="maneuver-card__field-label">Transportista</span>
            <span className="maneuver-card__field-value">{maneuver.man_transporter || 'PENDIENTE'}</span>
          </div>

          <div className="maneuver-card__field maneuver-card__field--stacked">
            <div className="maneuver-card__field-row">
              <span className="maneuver-card__field-label">Ubicación</span>
              <span className="maneuver-card__field-value">{maneuver.man_current_location || 'PENDIENTE'}</span>
            </div>
            <div className="maneuver-card__field-row">
              <span className="maneuver-card__field-label">Estatus</span>
              <StatusChip status={maneuver.man_current_status} />
            </div>
          </div>
        </div>

        <div className="maneuver-card__summary-side">
          <span className={`maneuver-card__chevron ${expanded ? 'maneuver-card__chevron--open' : ''}`}>
            ▾
          </span>
        </div>
      </button>

      {expanded && (
        <div className="maneuver-card__detail" ref={detailRef}>
          <ManeuverDetail maneuver={maneuver} />
        </div>
      )}
    </article>
  )
}
