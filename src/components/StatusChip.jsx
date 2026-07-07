import { statusColor } from '../utils/maneuver'

export default function StatusChip({ status }) {
  const color = statusColor(status)
  return <span className={`status-chip status-chip--${color}`}>{status || 'SIN ESTATUS'}</span>
}
