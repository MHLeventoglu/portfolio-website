import { Navigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useData()

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
