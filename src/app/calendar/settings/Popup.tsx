'use client'

import { ReactNode, useEffect, useRef } from 'react'

interface PopupProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  position?: 'center' | 'right'
}

export function Popup({ isOpen, onClose, title, children, position = 'right' }: PopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={`popup-wrapper popup-${position}`}>
      <div ref={popupRef} className={`popup-panel popup-panel-${position}`}>
        <div className="popup-header">
          <h2>{title}</h2>
          <button className="popup-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="popup-content">{children}</div>
      </div>
    </div>
  )
}
