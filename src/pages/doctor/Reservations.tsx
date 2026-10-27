import { useEffect, useState } from 'react'
import { ClipboardList, CalendarClock } from 'lucide-react'
import { useMyDoctor } from '../../hooks/useMyDoctor'
import { listDoctorReservations, confirmReservation, cancelReservation } from '../../features/reservations/api'
import { formatDateTime } from '../../lib/dateFormat'
import { getErrorMessage } from '../../lib/errors'
import type { ReservationForDoctor } from '../../types/database'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_TONE } from '../../features/reservations/statusLabels'
import './Reservations.css'

function Reservations() {
  const { doctor, loading: doctorLoading } = useMyDoctor()
  const [reservations, setReservations] = useState<ReservationForDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [potvrdaUTijeku, setPotvrdaUTijeku] = useState<string | null>(null)
  const [otkazivanje, setOtkazivanje] = useState<ReservationForDoctor | null>(null)
  const [otkazivanjeUTijeku, setOtkazivanjeUTijeku] = useState(false)

  function ucitaj() {
    if (!doctor) return
    setLoading(true)
    listDoctorReservations(doctor.id)
      .then(setReservations)
      .catch(() => setError('Nije moguće učitati rezervacije.'))
      .finally(() => setLoading(false))
  }

  useEffect(ucitaj, [doctor])

  async function handlePotvrdi(id: string) {
    setPotvrdaUTijeku(id)
    setError(null)
    try {
      await confirmReservation(id)
      ucitaj()
    } catch (err) {
      setError(getErrorMessage(err, 'Potvrda nije uspjela.'))
    } finally {
      setPotvrdaUTijeku(null)
    }
  }

  async function potvrdiOtkazivanje() {
    if (!otkazivanje) return
    setOtkazivanjeUTijeku(true)
    setError(null)
    try {
      await cancelReservation(otkazivanje.id)
      setOtkazivanje(null)
      ucitaj()
    } catch (err) {
      setError(getErrorMessage(err, 'Otkazivanje nije uspjelo.'))
    } finally {
      setOtkazivanjeUTijeku(false)
    }
  }

  if (doctorLoading || loading) return <Spinner label="Učitavanje rezervacija..." />
  if (!doctor) return <p>Vaš korisnički račun nije povezan s liječničkim profilom.</p>

  const moze_otkazati = (r: ReservationForDoctor) => r.status !== 'cancelled'

  return (
    <div>
      <h1>Rezervacije</h1>

      {error && <p className="doctor-reservations__error">{error}</p>}

      {reservations.length === 0 && (
        <EmptyState icon={ClipboardList} title="Trenutno nemate rezervacija" />
      )}

      <div className="doctor-reservations__list">
        {reservations.map((r) => (
          <Card key={r.id}>
            <div className="doctor-reservations__item">
              <div>
                <p className="doctor-reservations__patient">{r.patient_name}</p>
                <p className="doctor-reservations__meta">
                  <CalendarClock size={14} aria-hidden="true" /> {formatDateTime(r.start_at)}
                </p>
              </div>
              <div className="doctor-reservations__actions">
                <Badge tone={RESERVATION_STATUS_TONE[r.status]}>{RESERVATION_STATUS_LABEL[r.status]}</Badge>
                {r.status === 'pending' && (
                  <Button
                    variant="primary"
                    disabled={potvrdaUTijeku === r.id}
                    onClick={() => handlePotvrdi(r.id)}
                  >
                    {potvrdaUTijeku === r.id ? 'Potvrđivanje...' : 'Potvrdi'}
                  </Button>
                )}
                {moze_otkazati(r) && (
                  <Button variant="secondary" onClick={() => setOtkazivanje(r)}>
                    Otkaži
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {otkazivanje && (
        <ConfirmDialog
          title="Otkazivanje rezervacije"
          description={`Jeste li sigurni da želite otkazati rezervaciju pacijenta ${otkazivanje.patient_name} (${formatDateTime(otkazivanje.start_at)})?`}
          confirmLabel="Otkaži rezervaciju"
          onConfirm={potvrdiOtkazivanje}
          onCancel={() => setOtkazivanje(null)}
          busy={otkazivanjeUTijeku}
        />
      )}
    </div>
  )
}

export default Reservations
