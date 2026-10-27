import { useEffect, useMemo, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'
import { listDoctors } from '../../features/doctors/api'
import { listClinicReservations } from '../../features/reservations/api'
import { formatDateTime } from '../../lib/dateFormat'
import type { DoctorWithDetails, ReservationForAdmin, ReservationStatus } from '../../types/database'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_TONE } from '../../features/reservations/statusLabels'
import './Reservations.css'

function Reservations() {
  const { profile } = useAuth()
  const [reservations, setReservations] = useState<ReservationForAdmin[]>([])
  const [doctors, setDoctors] = useState<DoctorWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filterDoctor, setFilterDoctor] = useState('')
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | ''>('')
  const [filterDate, setFilterDate] = useState('')

  useEffect(() => {
    if (!profile?.clinic_id) return

    Promise.all([listDoctors({ clinicId: profile.clinic_id }), listClinicReservations(profile.clinic_id)])
      .then(([doctorsData, reservationsData]) => {
        setDoctors(doctorsData)
        setReservations(reservationsData)
      })
      .catch(() => setError('Nije moguće učitati rezervacije.'))
      .finally(() => setLoading(false))
  }, [profile])

  const filtrirane = useMemo(() => {
    return reservations.filter((r) => {
      if (filterDoctor && r.doctor_id !== filterDoctor) return false
      if (filterStatus && r.status !== filterStatus) return false
      if (filterDate && !r.start_at.startsWith(filterDate)) return false
      return true
    })
  }, [reservations, filterDoctor, filterStatus, filterDate])

  if (!profile?.clinic_id) return <p>Vaš korisnički račun nije povezan s nijednom ustanovom.</p>

  return (
    <div>
      <h1>Rezervacije</h1>

      {loading && <Spinner label="Učitavanje rezervacija..." />}
      {error && <p className="admin-reservations__error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="admin-reservations__filters">
            <div className="field">
              <label htmlFor="filter_doctor">Liječnik</label>
              <select id="filter_doctor" value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)}>
                <option value="">Svi liječnici</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="filter_status">Status</label>
              <select
                id="filter_status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ReservationStatus | '')}
              >
                <option value="">Svi statusi</option>
                <option value="pending">Na čekanju</option>
                <option value="confirmed">Potvrđeno</option>
                <option value="cancelled">Otkazano</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="filter_date">Datum</label>
              <input
                id="filter_date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>

          {filtrirane.length === 0 && (
            <EmptyState icon={ClipboardList} title="Nema rezervacija za odabrane filtre" />
          )}

          <div className="admin-reservations__list">
            {filtrirane.map((r) => (
              <Card key={r.id}>
                <div className="admin-reservations__row">
                  <div>
                    <p className="admin-reservations__title">Pacijent: {r.patient_name}</p>
                    <p className="admin-reservations__title">Liječnik: {r.doctor_name}</p>
                    <p className="admin-reservations__meta">{formatDateTime(r.start_at)}</p>
                  </div>
                  <Badge tone={RESERVATION_STATUS_TONE[r.status]}>{RESERVATION_STATUS_LABEL[r.status]}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Reservations
