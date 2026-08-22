import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Topbar from './Topbar.jsx'
import Sidebar from './Sidebar.jsx'

export default function Shell() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar onMenuToggle={() => setMenuOpen(o => !o)} />
      <div style={{ display: 'flex', flex: 1, paddingTop: 'var(--topbar-height)' }}>
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          padding: 'var(--space-6)',
          minWidth: 0,
          maxWidth: 'var(--content-max-width)',
        }}
        className="main-content"
        >
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            padding: var(--space-4) !important;
          }
        }
      `}</style>
    </div>
  )
}
