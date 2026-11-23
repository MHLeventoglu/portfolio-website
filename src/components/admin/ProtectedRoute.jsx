import { Navigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useData()

  if (loading && !isAuthenticated) {
    return <div className="admin-theme" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }} role="status">Yükleniyor…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
