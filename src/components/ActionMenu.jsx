import { useState } from 'react'

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l9-9M17 6l3 3M14 9l2 2" />
    </svg>
  )
}

function RefreshIcon({ spinning }) {
  return (
    <svg
      className={spinning ? 'action-menu__icon--spinning' : ''}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 11a8 8 0 10-2.34 6.36" />
      <path d="M20 5v6h-6" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function PollingIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8v4l2.5 2.5" />
      <circle cx="12" cy="13" r="7" />
      <path d="M9 2h6M12 2v3" />
      {!active && <path d="M4 4l16 16" />}
    </svg>
  )
}

function TooltipButton({ label, className, onClick, ariaExpanded, ariaPressed, children }) {
  return (
    <span className="action-menu__tooltip" data-tooltip={label}>
      <button
        type="button"
        className={className}
        onClick={onClick}
        aria-label={label}
        aria-expanded={ariaExpanded}
        aria-pressed={ariaPressed}
      >
        {children}
      </button>
    </span>
  )
}

export default function ActionMenu({ onChangeKey, onRefresh, refreshing = false, pollingEnabled = true, onTogglePolling }) {
  const [expanded, setExpanded] = useState(false)

  function handleChangeKey() {
    setExpanded(false)
    onChangeKey?.()
  }

  function handleRefresh() {
    onRefresh?.()
    setExpanded(false)
  }

  function handleTogglePolling() {
    onTogglePolling?.()
    setExpanded(false)
  }

  function handleCollapse() {
    setExpanded(false)
  }

  return (
    <div className="action-menu">
      {expanded ? (
        <>
          <TooltipButton
            label="Cambiar llave"
            className="action-menu__option neumo-button"
            onClick={handleChangeKey}
          >
            <KeyIcon />
          </TooltipButton>
          <TooltipButton
            label="Actualizar datos"
            className="action-menu__option neumo-button"
            onClick={handleRefresh}
          >
            <RefreshIcon spinning={refreshing} />
          </TooltipButton>
          <TooltipButton
            label={pollingEnabled ? 'Desactivar auto-actualización' : 'Activar auto-actualización'}
            className={`action-menu__option neumo-button ${pollingEnabled ? 'action-menu__option--active' : ''}`}
            onClick={handleTogglePolling}
            ariaPressed={pollingEnabled}
          >
            <PollingIcon active={pollingEnabled} />
          </TooltipButton>
          <TooltipButton
            label="Cerrar"
            className="action-menu__option neumo-button"
            onClick={handleCollapse}
          >
            <CloseIcon />
          </TooltipButton>
        </>
      ) : (
        <TooltipButton
          label="Más acciones"
          className="action-menu__toggle neumo-button"
          onClick={() => setExpanded(true)}
          ariaExpanded={expanded}
        >
          <DotsIcon />
        </TooltipButton>
      )}
    </div>
  )
}
