import { NavLink, Outlet } from 'react-router-dom'
import { Stethoscope, Search, Bell, CalendarPlus, UserCircle, LogOut } from 'lucide-react'
import Button from '../components/Button'
import { useAuth } from '../features/auth/useAuth'
import './PatientLayout.css'

function PatientLayout() {
  const { profile, signOut } = useAuth()

  return (
    <div className="patient-layout">
      <header className="patient-header">
        <NavLink to="/pacijent" className="patient-logo">
          <Stethoscope size={22} aria-hidden="true" />
          <span>Termio</span>
        </NavLink>

        <nav className="patient-nav" aria-label="Navigacija pacijenta">
          <NavLink to="/pacijent" end>
            Pregled ponude
          </NavLink>
          <NavLink to="/pacijent/rezervacije">Moje rezervacije</NavLink>
          <NavLink to="/pacijent/profil">Moj profil</NavLink>
        </nav>

        <div className="patient-search">
          <Search size={16} aria-hidden="true" />
          <input type="search" placeholder="Pretraži ustanove, liječnike ili specijalizacije..." />
        </div>

        <button type="button" className="patient-icon-btn" aria-label="Obavijesti">
          <Bell size={18} aria-hidden="true" />
        </button>

        <NavLink to="/pacijent">
          <Button variant="primary">
            <CalendarPlus size={16} aria-hidden="true" />
            Nova rezervacija
          </Button>
        </NavLink>

        <div className="patient-user">
          <UserCircle size={28} aria-hidden="true" />
          <span className="patient-user__role">{profile?.full_name || 'Pacijent'}</span>
          <button type="button" className="patient-icon-btn" aria-label="Odjava" onClick={() => signOut()}>
            <LogOut size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="patient-content">
        <Outlet />
      </main>
    </div>
  )
}

export default PatientLayout
