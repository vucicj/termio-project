import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Stethoscope, CalendarClock } from 'lucide-react'
import { listMyReservations } from '../../features/reservations/api'
import { formatDateTime } from '../../lib/dateFormat'
import type { ReservationWithDetails } from '../../types/database'
import { useAuth } from '../../features/auth/useAuth'
import Card from '../../components/Card'
import Spinner from '../../components/Spinner'
import Badge from '../../components/Badge'
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_TONE } from '../../features/reservations/statusLabels'
import './Discover.css'

function Discover() {
  const { profile } = useAuth()
  const [nadolazece, setNadolazece] = useState<ReservationWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listMyReservations()
      .then((sve) => {
        const sad = new Date().toISOString()
        setNadolazece(
          sve.filter((r) => r.status !== 'cancelled' && r.start_at > sad).slice(0, 3),
        )
      })
      .catch(() => setNadolazece([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1>Dobrodošli{profile ? `, ${profile.full_name}` : ''}</h1>
      <p className="discover__subtitle">Pronađite ustanovu ili liječnika i rezervirajte sljedeći pregled.</p>

      <div className="discover__actions">
        <Link to="/ustanove">
          <Card>
            <Building2 size={24} aria-hidden="true" />
            <h2>Zdravstvene ustanove</h2>
            <p>Pregledajte ustanove i njihove liječnike</p>
          </Card>
        </Link>
        <Link to="/lijecnici">
          <Card>
            <Stethoscope size={24} aria-hidden="true" />
            <h2>Liječnici</h2>
            <p>Pretražite po specijalizaciji i rezervirajte termin</p>
          </Card>
        </Link>
      </div>

      <h2 className="discover__section-title">Nadolazeće rezervacije</h2>

      {loading && <Spinner label="Učitavanje rezervacija..." />}

      {!loading && nadolazece.length === 0 && (
        <p className="discover__empty">Trenutno nemate nadolazećih rezervacija.</p>
      )}

      <div className="discover__reservations">
        {nadolazece.map((r) => (
          <Card key={r.id}>
            <div className="discover__reservation">
              <div>
                <p className="discover__reservation-doctor">{r.doctor_name}</p>
                <p className="discover__reservation-meta">
                  <CalendarClock size={14} aria-hidden="true" /> {formatDateTime(r.start_at)}
                </p>
              </div>
              <Badge tone={RESERVATION_STATUS_TONE[r.status]}>{RESERVATION_STATUS_LABEL[r.status]}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Discover
