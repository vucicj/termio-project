import { useEffect, useState } from 'react'
import { Users, CalendarClock, Hourglass } from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'
import { listDoctors } from '../../features/doctors/api'
import { listClinicAppointments } from '../../features/appointments/api'
import { listClinicReservations } from '../../features/reservations/api'
import { formatDateTime } from '../../lib/dateFormat'
import type { AppointmentWithDoctor, DoctorWithDetails, ReservationForAdmin } from '../../types/database'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_TONE } from '../../features/reservations/statusLabels'
import './Dashboard.css'

function pocetakDanasnjegDana(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function krajDanasnjegDana(): string {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

function Dashboard() {
  const { profile } = useAuth()
  const [doctors, setDoctors] = useState<DoctorWithDetails[]>([])
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([])
  const [reservations, setReservations] = useState<ReservationForAdmin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.clinic_id) return

    Promise.all([
      listDoctors({ clinicId: profile.clinic_id }),
      listClinicAppointments(profile.clinic_id),
      listClinicReservations(profile.clinic_id),
    ])
      .then(([doctorsData, appointmentsData, reservationsData]) => {
        setDoctors(doctorsData)
        setAppointments(appointmentsData)
        setReservations(reservationsData)
      })
      .finally(() => setLoading(false))
  }, [profile])

  if (loading) return <Spinner label="Učitavanje nadzorne ploče..." />

  if (!profile?.clinic_id) {
    return <p>Vaš korisnički račun nije povezan s nijednom ustanovom.</p>
  }

  const danas = appointments.filter(
    (a) => a.start_at >= pocetakDanasnjegDana() && a.start_at <= krajDanasnjegDana() && a.status === 'booked',
  )
  const naCekanju = reservations.filter((r) => r.status === 'pending')

  return (
    <div>
      <h1>Pregled ustanove</h1>
      <p className="dashboard__subtitle">Sažetak aktivnosti vaše ustanove.</p>

      <div className="dashboard__stats">
        <Card>
          <Users size={20} aria-hidden="true" />
          <p className="dashboard__stat-value">{doctors.length}</p>
          <p className="dashboard__stat-label">Liječnika</p>
        </Card>
        <Card>
          <CalendarClock size={20} aria-hidden="true" />
          <p className="dashboard__stat-value">{danas.length}</p>
          <p className="dashboard__stat-label">Termina danas</p>
        </Card>
        <Card>
          <Hourglass size={20} aria-hidden="true" />
          <p className="dashboard__stat-value">{naCekanju.length}</p>
          <p className="dashboard__stat-label">Rezervacija na čekanju</p>
        </Card>
      </div>

      <h2 className="dashboard__section-title">Nedavne rezervacije</h2>

      {reservations.length === 0 && (
        <EmptyState icon={Hourglass} title="Trenutno nema rezervacija u vašoj ustanovi" />
      )}

      <div className="dashboard__list">
        {reservations.slice(0, 5).map((r) => (
          <Card key={r.id}>
            <div className="dashboard__row">
              <div>
                <p className="dashboard__row-title">
                  {r.patient_name} — {r.doctor_name}
                </p>
                <p className="dashboard__row-meta">{formatDateTime(r.start_at)}</p>
              </div>
              <Badge tone={RESERVATION_STATUS_TONE[r.status]}>{RESERVATION_STATUS_LABEL[r.status]}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
