import { useNavigate } from 'react-router-dom'
import { useAppState } from '../context/AppContext.jsx'
import { SET_ROLE } from '../context/actions.js'
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_DEFAULT_ROUTES } from '../data/constants.js'

const ROLE_ICONS = {
  CS_REP:       '📋',
  FIELD_WORKER: '🔧',
  BILLER:       '📂',
  APPROVER_STX: '✅',
  APPROVER_WTX: '✅',
  ALYA:         '👤',
}

const ROLE_ACCENT = {
  CS_REP:       'var(--navy-light)',
  FIELD_WORKER: 'var(--navy)',
  BILLER:       'var(--navy-mid)',
  APPROVER_STX: '#2E7D32',
  APPROVER_WTX: '#1565C0',
  ALYA:         'var(--accent-dark)',
}

export default function LoginScreen() {
  const { dispatch } = useAppState()
  const navigate = useNavigate()

  function selectRole(role) {
    dispatch({ type: SET_ROLE, payload: role })
    navigate(ROLE_DEFAULT_ROUTES[role])
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-5)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-7)' }}>
        <div style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 700,
          color: 'var(--accent)',
          letterSpacing: '-0.02em',
          marginBottom: 'var(--space-2)',
        }}>
          Aly Energy Services
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--text-base)' }}>
          Select your role to continue
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'var(--space-4)',
        width: '100%',
        maxWidth: 900,
      }}>
        {Object.values(ROLES).map(role => (
          <button
            key={role}
            onClick={() => selectRole(role)}
            style={{
              background: 'var(--card)',
              border: '2px solid transparent',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast)',
              boxShadow: 'var(--shadow-md)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = ROLE_ACCENT[role]
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
            }}
          >
            <div style={{
              width: 44, height: 44,
              borderRadius: 'var(--radius-md)',
              background: ROLE_ACCENT[role],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
              marginBottom: 'var(--space-3)',
            }}>
              {ROLE_ICONS[role]}
            </div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text)', marginBottom: 'var(--space-1)' }}>
              {ROLE_LABELS[role]}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {ROLE_DESCRIPTIONS[role]}
            </div>
          </button>
        ))}
      </div>

      <p style={{
        marginTop: 'var(--space-6)',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 'var(--text-xs)',
      }}>
        Prototype — session only, no data is saved
      </p>
    </div>
  )
}
