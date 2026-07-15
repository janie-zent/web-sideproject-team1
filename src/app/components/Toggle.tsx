'use client'

import './toggle.css'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <div className="toggle-wrapper">
      {label && <span className="toggle-label">{label}</span>}
      <button
        onClick={() => !disabled && onChange(!checked)}
        className={`toggle-button ${checked ? 'on' : 'off'} ${disabled ? 'disabled' : ''}`}
        disabled={disabled}
      >
        <div className="toggle-circle" />
      </button>
    </div>
  )
}
