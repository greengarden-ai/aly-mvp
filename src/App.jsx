import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import Shell from './components/layout/Shell.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'

import LoginScreen from './screens/LoginScreen.jsx'

// Stubs for screens not yet built (Stage 2+)
function ComingSoon({ name }) {
  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <h2 style={{ color: 'var(--navy)', marginBottom: 'var(--space-3)' }}>{name}</h2>
      <p style={{ color: 'var(--text-muted)' }}>This screen will be built in the next stage.</p>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />

          <Route
            element={
              <ProtectedRoute>
                <Shell />
              </ProtectedRoute>
            }
          >
            <Route path="/cs/intake"           element={<ComingSoon name="Order Intake" />} />
            <Route path="/fieldworker/rig-move" element={<ComingSoon name="Rig Move Ticket" />} />
            <Route path="/fieldworker/rental"   element={<ComingSoon name="Rental Ticket" />} />
            <Route path="/biller/tickets"       element={<ComingSoon name="Ticket Assembly" />} />
            <Route path="/approver/routing"     element={<ComingSoon name="Approval Routing" />} />
            <Route path="/alya/cfo-approval"    element={<ComingSoon name="CFO Approval" />} />
            <Route path="/alya/exceptions"      element={<ComingSoon name="Exception Queue" />} />
            <Route path="/alya/fleet"           element={<ComingSoon name="Fleet & Equipment" />} />
            <Route path="/alya/dashboard"       element={<ComingSoon name="Dashboard" />} />
            <Route path="/alya/admin"           element={<ComingSoon name="Super Admin" />} />
            <Route path="/alya/help"            element={<ComingSoon name="Help & Guide" />} />
            <Route path="/shared/signature/:ticketId" element={<ComingSoon name="Signature Capture" />} />
            <Route path="/shared/invoice/:ticketId"   element={<ComingSoon name="Invoice" />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
