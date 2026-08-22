import { Navigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'

export default function ProtectedRoute({ children }) {
  const { state } = useAppState()
  if (!state.currentRole) return <Navigate to="/login" replace />
  return children
}
