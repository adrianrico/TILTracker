import { statusColor } from '../lib/maneuver'

/**
 * Etiqueta coloreada con el estatus (el color sale de `statusColor`).
 *
 * @param {object} props
 * @param {string} [props.status]
 */
export default function StatusChip({ status }) {
  const color = statusColor(status)
  return <span className={`status-chip status-chip--${color}`}>{status || 'SIN ESTATUS'}</span>
}
