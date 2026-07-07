import { parseEvents } from '../utils/maneuver'
import StatusChip from './StatusChip'

export default function EventsTimeline({ events }) {
  const parsed = parseEvents(events)

  if (parsed.length === 0) {
    return <p className="events-timeline__empty">Sin eventos registrados.</p>
  }

  return (
    <ol className="events-timeline">
      {parsed.map((e, i) => (
        <li key={i} className="events-timeline__item">
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
