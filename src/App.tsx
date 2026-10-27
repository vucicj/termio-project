import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AuthProvider } from './features/auth/AuthProvider'
import ProtectedRoute from './features/auth/ProtectedRoute'

import PublicLayout from './layouts/PublicLayout'
import PatientLayout from './layouts/PatientLayout'
import DoctorLayout from './layouts/DoctorLayout'
import AdminLayout from './layouts/AdminLayout'

import Home from './pages/public/Home'
import ClinicList from './pages/public/ClinicList'
import ClinicDetail from './pages/public/ClinicDetail'
import DoctorList from './pages/public/DoctorList'
import DoctorDetail from './pages/public/DoctorDetail'
import Login from './pages/public/Login'
import Register from './pages/public/Register'

import Discover from './pages/patient/Discover'
import MyReservations from './pages/patient/MyReservations'
import PatientProfile from './pages/patient/Profile'

import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorSchedule from './pages/doctor/Schedule'
import DoctorReservations from './pages/doctor/Reservations'

import AdminDashboard from './pages/admin/Dashboard'
import AdminDoctors from './pages/admin/Doctors'
import AdminAppointments from './pages/admin/Appointments'
import AdminReservations from './pages/admin/Reservations'
import AdminClinicProfile from './pages/admin/ClinicProfile'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/ustanove" element={<ClinicList />} />
            <Route path="/ustanove/:id" element={<ClinicDetail />} />
            <Route path="/lijecnici" element={<DoctorList />} />
            <Route path="/lijecnici/:id" element={<DoctorDetail />} />
            <Route path="/prijava" element={<Login />} />
            <Route path="/registracija" element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
            <Route path="/pacijent" element={<PatientLayout />}>
              <Route index element={<Discover />} />
              <Route path="rezervacije" element={<MyReservations />} />
              <Route path="profil" element={<PatientProfile />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
            <Route path="/lijecnik" element={<DoctorLayout />}>
              <Route index element={<DoctorDashboard />} />
              <Route path="raspored" element={<DoctorSchedule />} />
              <Route path="rezervacije" element={<DoctorReservations />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['clinic_admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="lijecnici" element={<AdminDoctors />} />
              <Route path="termini" element={<AdminAppointments />} />
              <Route path="rezervacije" element={<AdminReservations />} />
              <Route path="ustanova" element={<AdminClinicProfile />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
