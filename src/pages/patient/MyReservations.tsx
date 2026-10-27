import { useEffect, useState } from 'react'
import { CalendarClock, ClipboardList } from 'lucide-react'
import { listMyReservations, cancelReservation } from '../../features/reservations/api'
import { formatDateTime } from '../../lib/dateFormat'
import { getErrorMessage } from '../../lib/errors'
import type { ReservationWithDetails } from '../../types/database'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_TONE } from '../../features/reservations/statusLabels'
import './MyReservations.css'

function MyReservations() {
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [otkazivanje, setOtkazivanje] = useState<ReservationWithDetails | null>(null)
  const [otkazivanjeUTijeku, setOtkazivanjeUTijeku] = useState(false)
  const [otkazivanjeGreska, setOtkazivanjeGreska] = useState<string | null>(null)

  function ucitajRezervacije() {
    setLoading(true)
    listMyReservations()
      .then(setReservations)
      .catch(() => setError('Nije moguće učitati vaše rezervacije.'))
      .finally(() => setLoading(false))
  }

  useEffect(ucitajRezervacije, [])

  async function potvrdiOtkazivanje() {
    if (!otkazivanje) return

    setOtkazivanjeUTijeku(true)
    setOtkazivanjeGreska(null)

    try {
      await cancelReservation(otkazivanje.id)
      setOtkazivanje(null)
      ucitajRezervacije()
    } catch (err) {
      setOtkazivanjeGreska(getErrorMessage(err, 'Otkazivanje nije uspjelo.'))
    } finally {
      setOtkazivanjeUTijeku(false)
    }
  }

  const moze_otkazati = (r: ReservationWithDetails) => r.status !== 'cancelled' && r.start_at > new Date().toISOString()

  return (
    <div>
      <h1>Moje rezervacije</h1>

      {loading && <Spinner label="Učitavanje rezervacija..." />}
      {error && <p className="my-reservations__error">{error}</p>}

      {!loading && !error && reservations.length === 0 && (
        <EmptyState icon={ClipboardList} title="Nemate nijednu rezervaciju" />
      )}

      <div className="my-reservations__list">
        {reservations.map((r) => (
          <Card key={r.id}>
            <div className="my-reservations__item">
              <div>
                <p className="my-reservations__doctor">{r.doctor_name}</p>
                <p className="my-reservations__meta">{r.specialization} · {r.clinic_name}</p>
                <p className="my-reservations__meta">
                  <CalendarClock size={14} aria-hidden="true" /> {formatDateTime(r.start_at)}
                </p>
              </div>
              <div className="my-reservations__status-col">
                <Badge tone={RESERVATION_STATUS_TONE[r.status]}>{RESERVATION_STATUS_LABEL[r.status]}</Badge>
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
          description={`Jeste li sigurni da želite otkazati rezervaciju kod ${otkazivanje.doctor_name} (${formatDateTime(otkazivanje.start_at)})?`}
          confirmLabel="Otkaži rezervaciju"
          onConfirm={potvrdiOtkazivanje}
          onCancel={() => setOtkazivanje(null)}
          busy={otkazivanjeUTijeku}
        />
      )}

      {otkazivanjeGreska && <p className="my-reservations__error">{otkazivanjeGreska}</p>}
    </div>
  )
}

export default MyReservations
