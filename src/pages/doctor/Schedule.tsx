import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { useMyDoctor } from '../../hooks/useMyDoctor'
import { listDoctorAppointments } from '../../features/appointments/api'
import { formatDateTime } from '../../lib/dateFormat'
import type { Appointment } from '../../types/database'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import { APPOINTMENT_STATUS_LABEL, APPOINTMENT_STATUS_TONE } from '../../features/appointments/statusLabels'
import './Schedule.css'

function Schedule() {
  const { doctor, loading: doctorLoading } = useMyDoctor()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!doctor) return

    listDoctorAppointments(doctor.id)
      .then(setAppointments)
      .finally(() => setLoading(false))
  }, [doctor])

  if (doctorLoading || loading) return <Spinner label="Učitavanje rasporeda..." />
  if (!doctor) return <p>Vaš korisnički račun nije povezan s liječničkim profilom.</p>

  return (
    <div>
      <h1>Moj raspored</h1>

      {appointments.length === 0 && (
        <EmptyState icon={CalendarDays} title="Trenutno nemate otvorenih termina" />
      )}

      <div className="schedule__list">
        {appointments.map((a) => (
          <Card key={a.id}>
            <div className="schedule__row">
              <span>{formatDateTime(a.start_at)}</span>
              <Badge tone={APPOINTMENT_STATUS_TONE[a.status]}>{APPOINTMENT_STATUS_LABEL[a.status]}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Schedule
