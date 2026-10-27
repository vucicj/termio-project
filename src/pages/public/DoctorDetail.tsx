import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarClock, Stethoscope } from 'lucide-react'
import { getDoctor } from '../../features/doctors/api'
import { listAvailableAppointments } from '../../features/appointments/api'
import { bookAppointment } from '../../features/reservations/api'
import { useAuth } from '../../features/auth/useAuth'
import { formatDateTime } from '../../lib/dateFormat'
import { getErrorMessage } from '../../lib/errors'
import type { Appointment, DoctorWithDetails } from '../../types/database'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import './DoctorDetail.css'

function DoctorDetail() {
  const { id } = useParams<{ id: string }>()
  const { session, profile } = useAuth()

  const [doctor, setDoctor] = useState<DoctorWithDetails | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [bookingId, setBookingId] = useState<string | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookedMessage, setBookedMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    Promise.all([getDoctor(id), listAvailableAppointments(id)])
      .then(([doctorData, appointmentsData]) => {
        setDoctor(doctorData)
        setAppointments(appointmentsData)
      })
      .catch(() => setError('Nije moguće učitati podatke o liječniku.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleBooking(appointmentId: string) {
    setBookingId(appointmentId)
    setBookingError(null)
    setBookedMessage(null)

    try {
      await bookAppointment(appointmentId)
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId))
      setBookedMessage('Rezervacija je uspješno zabilježena. Status možete pratiti pod "Moje rezervacije".')
    } catch (err) {
      setBookingError(getErrorMessage(err, 'Rezervacija nije uspjela.'))
    } finally {
      setBookingId(null)
    }
  }

  if (loading) return <Spinner label="Učitavanje liječnika..." />
  if (error) return <p className="doctor-detail__error">{error}</p>
  if (!doctor) return <p>Liječnik nije pronađen.</p>

  const jePacijent = Boolean(session && profile?.role === 'patient')

  return (
    <div>
      <h1>{doctor.full_name}</h1>
      <p className="doctor-detail__specialization">{doctor.specialization}</p>
      <p className="doctor-detail__clinic">{doctor.clinic_name}</p>

      <h2 className="doctor-detail__section-title">Dostupni termini</h2>

      {bookedMessage && <p className="doctor-detail__success">{bookedMessage}</p>}
      {bookingError && <p className="doctor-detail__booking-error">{bookingError}</p>}

      {!session && (
        <p className="doctor-detail__login-hint">
          <Link to="/prijava">Prijavite se</Link> ili{' '}
          <Link to="/registracija">registrirajte</Link> da biste rezervirali termin.
        </p>
      )}

      {session && !jePacijent && (
        <p className="doctor-detail__login-hint">Rezervaciju termina mogu napraviti samo pacijenti.</p>
      )}

      {appointments.length === 0 && (
        <EmptyState
          icon={CalendarClock}
          title="Trenutno nema slobodnih termina"
          description="Pokušajte ponovno kasnije ili pogledajte drugog liječnika."
        />
      )}

      <div className="doctor-detail__appointments">
        {appointments.map((appointment) => (
          <Card key={appointment.id}>
            <div className="doctor-detail__appointment">
              <span>{formatDateTime(appointment.start_at)}</span>
              {jePacijent && (
                <Button
                  variant="primary"
                  disabled={bookingId === appointment.id}
                  onClick={() => handleBooking(appointment.id)}
                >
                  {bookingId === appointment.id ? 'Rezerviranje...' : 'Rezerviraj'}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="doctor-detail__icon-note">
        <Stethoscope size={16} aria-hidden="true" />
        <span>Svaki termin traje 30 minuta.</span>
      </div>
    </div>
  )
}

export default DoctorDetail
