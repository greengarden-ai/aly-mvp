import { useEffect } from 'react'

export default function Modal({ title, onClose, children, width = 520 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(13,43,78,0.45)',
        zIndex: 'var(--z-modal)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: width,
        maxHeight: '90vh',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '1px solid var(--border)',
        }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', lineHeight: 1 }}
          >✕</button>
        </div>
        <div style={{ padding: 'var(--space-5)', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
