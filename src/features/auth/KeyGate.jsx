import { useEffect, useRef, useState } from 'react'
import { isValidKeyFormat } from './keyFormat'
import { growIn } from '@/shared/lib/animations'

const FORMAT_ERROR = 'La llave solo puede contener letras, números, guion y guion bajo (4-100 caracteres).'

/**
 * Pantalla de entrada: pide la llave de seguimiento y valida su formato
 * antes de entregarla a `onSubmit`. El botón aparece (animado) solo cuando
 * hay texto escrito.
 *
 * @param {object} props
 * @param {(key: string) => void} props.onSubmit Recibe la llave ya recortada y válida.
 * @param {string} [props.notice] Aviso externo (p. ej. "tu llave ya no es válida").
 */
export default function KeyGate({ onSubmit, notice }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const buttonRef = useRef(null)
  const hasText = value.trim().length > 0
  // Evita relanzar la animación en cada pulsación: solo al pasar de vacío a con texto.
  const wasVisibleRef = useRef(false)

  useEffect(() => {
    if (hasText && !wasVisibleRef.current) growIn(buttonRef.current)
    wasVisibleRef.current = hasText
  }, [hasText])

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()

    if (!isValidKeyFormat(trimmed)) {
      setError(FORMAT_ERROR)
      return
    }

    setError('')
    onSubmit(trimmed)
  }

  return (
    <div className="key-gate">
      <form className="key-gate__card glass neumo" onSubmit={handleSubmit}>
        <h1 className="key-gate__title">TIL TRACKER</h1>
        <p className="key-gate__subtitle">Ingresa tu llave de seguimiento</p>

        {notice && <p className="key-gate__notice">{notice}</p>}

        <input
          className="key-gate__input neumo-inset"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          maxLength={100}
          placeholder="LLAVE"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        {error && <p className="key-gate__error">{error}</p>}

        <button
          ref={buttonRef}
          className={`key-gate__button neumo-button ${hasText ? '' : 'key-gate__button--hidden'}`}
          type="submit"
          disabled={!hasText}
        >
          Ver mis maniobras
        </button>
      </form>
    </div>
  )
}
