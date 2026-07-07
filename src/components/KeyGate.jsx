import { useState } from 'react'
import { isValidKeyFormat } from '../utils/security'

const FORMAT_ERROR = 'La llave solo puede contener letras, números, guion y guion bajo (4-100 caracteres).'

export default function KeyGate({ onSubmit, notice }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

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

        <button className="key-gate__button neumo-button" type="submit">
          Ver mis maniobras
        </button>
      </form>
    </div>
  )
}
