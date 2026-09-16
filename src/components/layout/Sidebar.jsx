import { NavLink } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { ROLES } from '../../data/constants.js'

const NAV_CONFIG = {
  [ROLES.CS_REP]: [
    { label: 'Order Intake', path: '/cs/intake', icon: '📋' },
  ],
  [ROLES.FIELD_WORKER]: [
    { label: 'Field Ticket',    path: '/fieldworker/field-ticket', icon: '📝' },
    { label: 'Rental Ticket',   path: '/fieldworker/rental',       icon: '📅' },
  ],
  [ROLES.BILLER]: [
    { label: 'Ticket Assembly', path: '/biller/tickets', icon: '📂' },
  ],
  [ROLES.APPROVER_STX]: [
    { label: 'Approval Queue', path: '/approver/routing', icon: '✅' },
  ],
  [ROLES.APPROVER_WTX]: [
    { label: 'Approval Queue', path: '/approver/routing', icon: '✅' },
  ],
  [ROLES.ALYA]: [
    { label: 'Dashboard',       path: '/alya/dashboard',    icon: '📊' },
    { label: 'Exception Queue', path: '/alya/exceptions',   icon: '🚨' },
    { label: 'CFO Approval',    path: '/alya/cfo-approval', icon: '✅' },
    { label: 'Fleet & Equipment', path: '/alya/fleet',      icon: '🏗️' },
    { label: 'Price Books Reference', path: '/alya/price-books', icon: '💰' },
    { label: 'Super Admin',     path: '/alya/admin',        icon: '⚙️' },
    { divider: true },
    { label: 'Order Intake',    path: '/cs/intake',           icon: '📋' },
    { label: 'Field Ticket',    path: '/fieldworker/field-ticket', icon: '📝' },
    { label: 'Rental Ticket',   path: '/fieldworker/rental',       icon: '📅' },
    { label: 'Ticket Assembly', path: '/biller/tickets',           icon: '📂' },
    { label: 'Approval Queue',  path: '/approver/routing',     icon: '🔄' },
    { divider: true },
    { label: 'Help & Guide',    path: '/alya/help',           icon: '❓' },
  ],
}

export default function Sidebar({ open, onClose }) {
  const { state } = useAppState()
  const role = state.currentRole
  const links = NAV_CONFIG[role] ?? []

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 'calc(var(--z-sidebar) - 1)',
          }}
          className="hide-mobile"
        />
      )}

      <nav style={{
        position: 'fixed',
        top: 'var(--topbar-height)',
        left: 0,
        bottom: 0,
        width: 'var(--sidebar-width)',
        background: 'var(--navy-mid)',
        overflowY: 'auto',
        zIndex: 'var(--z-sidebar)',
        padding: 'var(--space-4) 0',
        transform: open ? 'translateX(0)' : undefined,
        transition: 'transform var(--transition-base)',
      }}
      className={open ? '' : 'hide-mobile'}
      >
        <ul style={{ listStyle: 'none' }}>
          {links.map((item, i) => {
            if (item.divider) {
              return (
                <li key={`div-${i}`} style={{
                  height: 1,
                  background: 'rgba(255,255,255,0.1)',
                  margin: 'var(--space-2) var(--space-4)',
                }} />
              )
            }
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: '10px var(--space-5)',
                    color: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.8)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 'var(--text-sm)',
                    textDecoration: 'none',
                    background: isActive ? 'rgba(245,166,35,0.1)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                    transition: 'background var(--transition-fast), color var(--transition-fast)',
                  })}
                >
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
