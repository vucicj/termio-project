import { NavLink, Outlet } from 'react-router-dom'
import {
  Stethoscope,
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarDays,
  Building2,
  UserCircle,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'
import './SidebarLayout.css'

function AdminLayout() {
  const { profile, signOut } = useAuth()

  return (
    <div className="sidebar-layout">
      <aside className="sidebar">
        <NavLink to="/admin" className="sidebar-logo">
          <Stethoscope size={22} aria-hidden="true" />
          <span>Termio</span>
        </NavLink>

        <nav className="sidebar-nav" aria-label="Navigacija administratora">
          <NavLink to="/admin" end>
            <LayoutDashboard size={18} aria-hidden="true" />
            <span>Pregled</span>
          </NavLink>
          <NavLink to="/admin/lijecnici">
            <Users size={18} aria-hidden="true" />
            <span>Liječnici</span>
          </NavLink>
          <NavLink to="/admin/termini">
            <CalendarDays size={18} aria-hidden="true" />
            <span>Termini</span>
          </NavLink>
          <NavLink to="/admin/rezervacije">
            <ClipboardList size={18} aria-hidden="true" />
            <span>Rezervacije</span>
          </NavLink>
          <NavLink to="/admin/ustanova">
            <Building2 size={18} aria-hidden="true" />
            <span>Podaci ustanove</span>
          </NavLink>
        </nav>

        <div className="sidebar-user">
          <UserCircle size={28} aria-hidden="true" />
          <div>
            <p className="sidebar-user__role">{profile?.full_name || 'Administrator'}</p>
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

export default AdminLayout
