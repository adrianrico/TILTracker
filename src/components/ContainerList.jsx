export default function ContainerList({ containers }) {
  if (!containers?.length) return null

  return (
    <div className="container-list">
      <h3 className="container-list__title">Contenedores ({containers.length})</h3>
      <div className="container-list__grid">
        {containers.map((c, i) => {
          const rows = [
            ['Tamaño', c.container_size ? `${c.container_size} pies` : null],
            ['Tipo', c.container_type || null],
            ['Contenido', c.container_content || null],
            ['Peso', c.container_weight ? `${c.container_weight} kg` : null],
          ].filter(([, value]) => value)

          return (
            <div key={c.container_id ?? i} className="container-card glass">
              <div className="container-card__id">{c.container_id || '—'}</div>
              {rows.length === 0 ? (
                <div className="container-card__row container-card__row--empty">
                  <span>Sin datos adicionales</span>
                </div>
              ) : (
                rows.map(([label, value]) => (
                  <div key={label} className="container-card__row">
                    <span className="container-card__label">{label}</span>
                    <span className="container-card__value">{value}</span>
                  </div>
                ))
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
