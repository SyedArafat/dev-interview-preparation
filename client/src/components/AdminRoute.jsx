import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AdminRoute() {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg-page)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user)            return <Navigate to="/login" replace />
  if (role !== 'admin') return <Navigate to="/" replace state={{ forbidden: true }} />

  return <Outlet />
}

