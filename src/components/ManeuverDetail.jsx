import EventsTimeline from './EventsTimeline'
import ContainerList from './ContainerList'
import GPSCanvas from './GPSCanvas'

function Field({ label, value }) {
  return (
    <div className="maneuver-detail__field">
      <span className="maneuver-detail__field-label">{label}</span>
      <span className="maneuver-detail__field-value">{value || 'PENDIENTE'}</span>
    </div>
  )
}

export default function ManeuverDetail({ maneuver }) {
  return (
    <div className="maneuver-detail">
      <div className="maneuver-detail__grid">
        <Field label="Tipo de maniobra" value={maneuver.man_type} />
        <Field label="Modalidad" value={maneuver.man_modality} />
        <Field label="Fecha de despacho" value={maneuver.man_dispatch_date} />
        <Field label="Fecha de término" value={maneuver.man_finish_date} />
        <Field label="Origen" value={maneuver.man_load_location} />
        <Field label="Destino" value={maneuver.man_unload_location} />
        <Field label="Eco" value={maneuver.man_eco} />
        <Field label="Operador" value={maneuver.man_operator} />
      </div>

      <div className="maneuver-detail__section">
        <h3 className="maneuver-detail__section-title">Historial de eventos</h3>
        <EventsTimeline events={maneuver.man_events} />
      </div>

      <div className="maneuver-detail__section">
        <ContainerList containers={maneuver.man_containers} />
      </div>

      <div className="maneuver-detail__section">
        <h3 className="maneuver-detail__section-title">Ubicación GPS</h3>
        <GPSCanvas gpsLink={maneuver.man_gps_link} />
      </div>
    </div>
  )
}
