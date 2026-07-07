import { useEffect, useRef, useState } from 'react'
import ProgressRing from './ProgressRing'
import StatusChip from './StatusChip'
import ManeuverDetail from './ManeuverDetail'
import { expandReveal } from '../utils/animations'

export default function ManeuverCard({ maneuver }) {
  const [expanded, setExpanded] = useState(false)
  const detailRef = useRef(null)
  const containers = maneuver.man_containers ?? []
  const containerIds = containers.map((c) => c.container_id).filter(Boolean)

  useEffect(() => {
    if (expanded) expandReveal(detailRef.current)
  }, [expanded])

  return (
    <article className="maneuver-card glass neumo">
      <button
        className="maneuver-card__summary"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="maneuver-card__summary-main">
          <span className="maneuver-card__id">{maneuver.man_id}</span>

          <div className="maneuver-card__field">
            <span className="maneuver-card__field-label">Contenedores</span>
            <span className="maneuver-card__field-value">
              {containers.length > 0 ? `${containers.length} — ${containerIds.join(', ')}` : 'Sin contenedores'}
            </span>
          </div>

          <div className="maneuver-card__field">
            <span className="maneuver-card__field-label">Transportista</span>
            <span className="maneuver-card__field-value">{maneuver.man_transporter || 'PENDIENTE'}</span>
          </div>

          <div className="maneuver-card__field">
            <span className="maneuver-card__field-label">Ubicación</span>
            <span className="maneuver-card__field-value">{maneuver.man_current_location || 'PENDIENTE'}</span>
          </div>

          <StatusChip status={maneuver.man_current_status} />
        </div>

        <div className="maneuver-card__summary-side">
          <ProgressRing progress={maneuver.man_progress} />
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
