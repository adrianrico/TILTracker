import { Component } from 'react'

/**
 * Red de seguridad: si algún componente hijo lanza un error al renderizar,
 * muestra un mensaje en lugar de dejar la pantalla en blanco.
 *
 * Los Error Boundaries solo existen como clase (React no tiene equivalente
 * con hooks). No captura errores de eventos ni de código asíncrono.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  /** React llama a este método estático cuando un descendiente falla. */
  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    // Solo consola: nunca se muestra el detalle técnico al usuario final.
    console.error('Error de interfaz:', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="tracker-view__state glass" role="alert">
        <p>Algo salió mal al mostrar la pantalla.</p>
        <button className="neumo-button" onClick={() => window.location.reload()}>
          Recargar
        </button>
      </div>
    )
  }
}
