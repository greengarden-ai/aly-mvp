import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import Shell from './components/layout/Shell.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'

import LoginScreen from './screens/LoginScreen.jsx'
import OrderIntakeScreen from './screens/cs/OrderIntakeScreen.jsx'
import FieldTicketScreen from './screens/fieldworker/FieldTicketScreen.jsx'
import RentalTicketScreen from './screens/fieldworker/RentalTicketScreen.jsx'
import TicketAssemblyScreen from './screens/biller/TicketAssemblyScreen.jsx'
import ApprovalRoutingScreen from './screens/approver/ApprovalRoutingScreen.jsx'
import CFOApprovalScreen from './screens/alya/CFOApprovalScreen.jsx'
import SignatureScreen from './screens/shared/SignatureScreen.jsx'
import InvoiceScreen from './screens/shared/InvoiceScreen.jsx'
import ExceptionQueueScreen from './screens/alya/ExceptionQueueScreen.jsx'
import FleetScreen from './screens/alya/FleetScreen.jsx'
import DashboardScreen from './screens/alya/DashboardScreen.jsx'
import SuperAdminScreen from './screens/alya/SuperAdminScreen.jsx'
import HelpScreen from './screens/alya/HelpScreen.jsx'
import PriceBooksScreen from './screens/alya/PriceBooksScreen.jsx'

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
            <Route path="/fieldworker/field-ticket"    element={<FieldTicketScreen />} />
            <Route path="/fieldworker/rig-move"        element={<FieldTicketScreen />} />
            <Route path="/fieldworker/rental"          element={<RentalTicketScreen />} />
            <Route path="/biller/tickets"              element={<TicketAssemblyScreen />} />
            <Route path="/approver/routing"            element={<ApprovalRoutingScreen />} />
            <Route path="/alya/cfo-approval"           element={<CFOApprovalScreen />} />
            <Route path="/shared/signature/:ticketId"  element={<SignatureScreen />} />
            <Route path="/shared/invoice/:ticketId"    element={<InvoiceScreen />} />

            <Route path="/alya/exceptions" element={<ExceptionQueueScreen />} />
            <Route path="/alya/fleet"      element={<FleetScreen />} />
            <Route path="/alya/dashboard"  element={<DashboardScreen />} />
            <Route path="/alya/price-books" element={<PriceBooksScreen />} />

            <Route path="/alya/admin" element={<SuperAdminScreen />} />
            <Route path="/alya/help"  element={<HelpScreen />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
