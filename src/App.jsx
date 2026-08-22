import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import Shell from './components/layout/Shell.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'

import LoginScreen from './screens/LoginScreen.jsx'
import OrderIntakeScreen from './screens/cs/OrderIntakeScreen.jsx'
import RigMoveTicketScreen from './screens/fieldworker/RigMoveTicketScreen.jsx'
import RentalTicketScreen from './screens/fieldworker/RentalTicketScreen.jsx'
import TicketAssemblyScreen from './screens/biller/TicketAssemblyScreen.jsx'
import ApprovalRoutingScreen from './screens/approver/ApprovalRoutingScreen.jsx'
import CFOApprovalScreen from './screens/alya/CFOApprovalScreen.jsx'
import SignatureScreen from './screens/shared/SignatureScreen.jsx'
import InvoiceScreen from './screens/shared/InvoiceScreen.jsx'
import ExceptionQueueScreen from './screens/alya/ExceptionQueueScreen.jsx'
import FleetScreen from './screens/alya/FleetScreen.jsx'
import DashboardScreen from './screens/alya/DashboardScreen.jsx'

// Stage 4 screens — stubs until Stage 4 build
function ComingSoon({ name }) {
  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <h2 style={{ color: 'var(--navy)', marginBottom: 'var(--space-3)' }}>{name}</h2>
      <p style={{ color: 'var(--text-muted)' }}>Coming in Stage 4.</p>
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
            <Route path="/cs/intake"                   element={<OrderIntakeScreen />} />
            <Route path="/fieldworker/rig-move"        element={<RigMoveTicketScreen />} />
            <Route path="/fieldworker/rental"          element={<RentalTicketScreen />} />
            <Route path="/biller/tickets"              element={<TicketAssemblyScreen />} />
            <Route path="/approver/routing"            element={<ApprovalRoutingScreen />} />
            <Route path="/alya/cfo-approval"           element={<CFOApprovalScreen />} />
            <Route path="/shared/signature/:ticketId"  element={<SignatureScreen />} />
            <Route path="/shared/invoice/:ticketId"    element={<InvoiceScreen />} />

            <Route path="/alya/exceptions" element={<ExceptionQueueScreen />} />
            <Route path="/alya/fleet"      element={<FleetScreen />} />
            <Route path="/alya/dashboard"  element={<DashboardScreen />} />

            {/* Stage 4 */}
            <Route path="/alya/admin" element={<ComingSoon name="Super Admin" />} />
            <Route path="/alya/help"  element={<ComingSoon name="Help & Guide" />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
