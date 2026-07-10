import { summarizeManeuvers } from '../utils/maneuver'

function TotalIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <rect x="3" y="10" width="18" height="4" rx="1" />
      <rect x="3" y="16" width="18" height="4" rx="1" />
    </svg>
  )
}

function StartedIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  )
}

function PendingIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}

function CancelledIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  )
}

export default function ManeuverStats({ maneuvers }) {
  const { started, pending, cancelled } = summarizeManeuvers(maneuvers)

  return (
    <ul className="maneuver-stats">
      <li className="maneuver-stats__item maneuver-stats__item--total">
        <TotalIcon />
        <span>{maneuvers.length} total</span>
      </li>
      <li className="maneuver-stats__item maneuver-stats__item--started">
        <StartedIcon />
        <span>{started} iniciadas</span>
      </li>
      <li className="maneuver-stats__item maneuver-stats__item--pending">
        <PendingIcon />
        <span>{pending} sin iniciar</span>
      </li>
      <li className="maneuver-stats__item maneuver-stats__item--cancelled">
        <CancelledIcon />
        <span>{cancelled} canceladas</span>
      </li>
    </ul>
  )
}
