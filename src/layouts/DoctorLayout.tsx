import { NavLink, Outlet } from 'react-router-dom'
import { Stethoscope, LayoutDashboard, CalendarDays, ClipboardList, UserCircle, LogOut } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'
import './SidebarLayout.css'

function DoctorLayout() {
  const { profile, signOut } = useAuth()

  return (
    <div className="sidebar-layout">
      <aside className="sidebar">
        <NavLink to="/lijecnik" className="sidebar-logo">
          <Stethoscope size={22} aria-hidden="true" />
          <span>Termio</span>
        </NavLink>

        <nav className="sidebar-nav" aria-label="Navigacija liječnika">
          <NavLink to="/lijecnik" end>
            <LayoutDashboard size={18} aria-hidden="true" />
            <span>Nadzorna ploča</span>
          </NavLink>
          <NavLink to="/lijecnik/raspored">
            <CalendarDays size={18} aria-hidden="true" />
            <span>Moj raspored</span>
          </NavLink>
          <NavLink to="/lijecnik/rezervacije">
            <ClipboardList size={18} aria-hidden="true" />
            <span>Rezervacije</span>
          </NavLink>
        </nav>

        <div className="sidebar-user">
          <UserCircle size={28} aria-hidden="true" />
          <div>
            <p className="sidebar-user__role">{profile?.full_name || 'Liječnik'}</p>
          </div>
          <button type="button" className="sidebar-user__logout" aria-label="Odjava" onClick={() => signOut()}>
            <LogOut size={16} aria-hidden="true" />
          </button>
        </div>
      </aside>

      <main className="sidebar-content">
        <Outlet />
      </main>
    </div>
  )
}

export default DoctorLayout
