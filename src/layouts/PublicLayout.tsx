import { NavLink, Outlet } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'
import Button from '../components/Button'
import { useAuth } from '../features/auth/useAuth'
import type { UserRole } from '../types/database'
import './PublicLayout.css'

const PUTANJA_PO_ULOZI: Record<UserRole, string> = {
  patient: '/pacijent',
  doctor: '/lijecnik',
  clinic_admin: '/admin',
}

function PublicLayout() {
  const { session, profile, signOut } = useAuth()

  return (
    <div className="public-layout">
      <header className="public-header">
        <NavLink to="/" className="public-logo">
          <Stethoscope size={22} aria-hidden="true" />
          <span>Termio</span>
        </NavLink>

        <nav className="public-nav" aria-label="Glavna navigacija">
          <NavLink to="/" end>
            Početna
          </NavLink>
          <NavLink to="/ustanove">Ustanove</NavLink>
          <NavLink to="/lijecnici">Liječnici</NavLink>
        </nav>

        <div className="public-actions">
          {session && profile ? (
            <>
              <NavLink to={PUTANJA_PO_ULOZI[profile.role]}>
                <Button variant="ghost">Moj nalog</Button>
              </NavLink>
              <Button variant="secondary" onClick={() => signOut()}>
                Odjava
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/prijava">
                <Button variant="ghost">Prijava</Button>
              </NavLink>
              <NavLink to="/registracija">
                <Button variant="primary">Registracija</Button>
              </NavLink>
            </>
          )}
        </div>
      </header>

      <main className="public-content">
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout
