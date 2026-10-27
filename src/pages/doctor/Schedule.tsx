import { useEffect, useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { useMyDoctor } from '../../hooks/useMyDoctor'
import { listDoctorAppointments } from '../../features/appointments/api'
import { formatDateTime } from '../../lib/dateFormat'
import type { Appointment } from '../../types/database'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import { APPOINTMENT_STATUS_LABEL, APPOINTMENT_STATUS_TONE } from '../../features/appointments/statusLabels'
import './Schedule.css'

function Schedule() {
  const { doctor, loading: doctorLoading } = useMyDoctor()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showPast, setShowPast] = useState(false)

  useEffect(() => {
    if (!doctor) return

    listDoctorAppointments(doctor.id)
      .then(setAppointments)
      .finally(() => setLoading(false))
  }, [doctor])

  const { nadolazeci, prosli } = useMemo(() => {
    const sad = new Date().toISOString()
    return {
      nadolazeci: appointments.filter((a) => a.start_at >= sad),
      prosli: appointments.filter((a) => a.start_at < sad).reverse(),
    }
  }, [appointments])

  if (doctorLoading || loading) return <Spinner label="Učitavanje rasporeda..." />
  if (!doctor) return <p>Vaš korisnički račun nije povezan s liječničkim profilom.</p>

  return (
    <div>
      <h1>Moj raspored</h1>

      {appointments.length === 0 && (
        <EmptyState icon={CalendarDays} title="Trenutno nemate otvorenih termina" />
      )}

      {appointments.length > 0 && nadolazeci.length === 0 && (
        <p className="schedule__hint">Nemate nadolazećih termina.</p>
      )}

      <div className="schedule__list">
        {nadolazeci.map((a) => (
          <Card key={a.id}>
            <div className="schedule__row">
              <span>{formatDateTime(a.start_at)}</span>
              <Badge tone={APPOINTMENT_STATUS_TONE[a.status]}>{APPOINTMENT_STATUS_LABEL[a.status]}</Badge>
            </div>
          </Card>
        ))}
      </div>

      {prosli.length > 0 && (
        <div className="schedule__past">
          <Button variant="secondary" onClick={() => setShowPast((v) => !v)}>
            {showPast ? 'Sakrij prošle termine' : `Prikaži prošle termine (${prosli.length})`}
          </Button>

          {showPast && (
            <div className="schedule__list schedule__list--past">
              {prosli.map((a) => (
                <Card key={a.id}>
                  <div className="schedule__row">
                    <span>{formatDateTime(a.start_at)}</span>
                    <Badge tone={APPOINTMENT_STATUS_TONE[a.status]}>{APPOINTMENT_STATUS_LABEL[a.status]}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Schedule
