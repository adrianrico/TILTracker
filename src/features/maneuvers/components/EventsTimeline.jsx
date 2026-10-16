import { parseEvents } from '../lib/maneuver'
import StatusChip from './StatusChip'

/**
 * Línea de tiempo vertical de eventos de la maniobra (más reciente primero).
 *
 * @param {object} props
 * @param {Array<string>} [props.events] `man_events` crudo (array plano de 4 en 4).
 */
export default function EventsTimeline({ events }) {
  const parsed = parseEvents(events)

  if (parsed.length === 0) {
    return <p className="events-timeline__empty">Sin eventos registrados.</p>
  }

  return (
    <ol className="events-timeline">
      {parsed.map((e, i) => (
        // Índice como key: la lista es de solo lectura y no se reordena.
        <li key={i}className="events-timeline__item">
          <span className="events-timeline__dot" />
          <div className="events-timeline__content">
            <span className="events-timeline__time">{e.time}</span>
            <strong className="events-timeline__location">{e.location}</strong>
            <StatusChip status={e.status} />
            <span className="events-timeline__percentage">{e.percentage}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}
