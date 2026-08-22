import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { LOGOUT } from '../../context/actions.js'
import { ROLE_LABELS, ROLES } from '../../data/constants.js'

export default function Topbar({ onMenuToggle }) {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()

  function handleSwitchRole() {
    dispatch({ type: LOGOUT })
    navigate('/login')
  }

  return (
    <header style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: 'var(--topbar-height)',
      background: 'var(--navy)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--space-4)',
      zIndex: 'var(--z-topbar)',
      gap: 'var(--space-3)',
    }}>
      <button
        className="hide-desktop"
        onClick={onMenuToggle}
        style={{
          color: 'white', fontSize: 20, background: 'none',
          border: 'none', cursor: 'pointer', padding: 4,
        }}
        aria-label="Toggle menu"
      >☰</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1 }}>
        <span style={{
          color: 'var(--accent)',
          fontWeight: 700,
          fontSize: 'var(--text-lg)',
          letterSpacing: '-0.02em',
        }}>
          Aly Energy Services
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {state.currentRole && (
          <span style={{
            background: 'rgba(255,255,255,0.12)',
            color: 'var(--text-inverse)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
          }}>
            {ROLE_LABELS[state.currentRole]}
          </span>
        )}
        <button
          onClick={() => navigate('/alya/help')}
          style={{
            color: 'rgba(255,255,255,0.7)', background: 'none',
            border: 'none', cursor: 'pointer', fontSize: 18,
            padding: 4,
          }}
          title="Help & Navigation Guide"
          aria-label="Help"
        >?</button>
        <button
          onClick={handleSwitchRole}
          style={{
            color: 'rgba(255,255,255,0.85)',
            background: 'none',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '5px 12px',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Switch Role
        </button>
      </div>
    </header>
  )
}
