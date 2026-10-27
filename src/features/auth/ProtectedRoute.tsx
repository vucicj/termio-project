import { Navigate, Outlet } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from './useAuth'
import Spinner from '../../components/Spinner'
import type { UserRole } from '../../types/database'

type ProtectedRouteProps = {
  allowedRoles: UserRole[]
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return <Spinner label="Provjera prijave..." />
  }

  if (!session) {
    return <Navigate to="/prijava" replace />
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return (
      <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <ShieldAlert size={32} aria-hidden="true" style={{ color: 'var(--color-danger)' }} />
        <h1>Nemate ovlasti za pristup ovoj stranici</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Vaš korisnički račun nema potrebnu ulogu za pregled ovog sadržaja.
        </p>
      </div>
    )
  }

  return <Outlet />
}

export default ProtectedRoute
