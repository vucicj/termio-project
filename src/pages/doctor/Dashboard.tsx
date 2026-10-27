import { useEffect, useState } from 'react'
import { CalendarClock, ClipboardList, Hourglass } from 'lucide-react'
import { useMyDoctor } from '../../hooks/useMyDoctor'
import { listDoctorAppointments } from '../../features/appointments/api'
import { listDoctorReservations } from '../../features/reservations/api'
import { formatDateTime } from '../../lib/dateFormat'
import type { Appointment, ReservationForDoctor } from '../../types/database'
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
  const { doctor, loading: doctorLoading } = useMyDoctor()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [reservations, setReservations] = useState<ReservationForDoctor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!doctor) return

    Promise.all([listDoctorAppointments(doctor.id), listDoctorReservations(doctor.id)])
      .then(([appointmentsData, reservationsData]) => {
        setAppointments(appointmentsData)
        setReservations(reservationsData)
      })
      .finally(() => setLoading(false))
  }, [doctor])

  if (doctorLoading || loading) return <Spinner label="Učitavanje nadzorne ploče..." />

  if (!doctor) {
    return <p>Vaš korisnički račun nije povezan s liječničkim profilom. Obratite se administratoru.</p>
  }

  const danas = appointments.filter(
    (a) => a.start_at >= pocetakDanasnjegDana() && a.start_at <= krajDanasnjegDana() && a.status === 'booked',
  )
  const naCekanju = reservations.filter((r) => r.status === 'pending')
  const nadolazece = reservations.filter((r) => r.status !== 'cancelled' && r.start_at > new Date().toISOString())

  return (
    <div>
      <h1>Nadzorna ploča</h1>
      <p className="dashboard__subtitle">Pregled vaših termina i rezervacija.</p>

      <div className="dashboard__stats">
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
        <Card>
          <ClipboardList size={20} aria-hidden="true" />
          <p className="dashboard__stat-value">{nadolazece.length}</p>
          <p className="dashboard__stat-label">Nadolazećih rezervacija</p>
        </Card>
      </div>

      <h2 className="dashboard__section-title">Rezervacije na čekanju</h2>

      {naCekanju.length === 0 && (
        <EmptyState icon={ClipboardList} title="Trenutno nema rezervacija na čekanju" />
      )}

      <div className="dashboard__list">
        {naCekanju.map((r) => (
          <Card key={r.id}>
            <div className="dashboard__row">
              <div>
                <p className="dashboard__row-title">{r.patient_name}</p>
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
