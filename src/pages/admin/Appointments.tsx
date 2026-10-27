import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarDays, Plus } from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'
import { listDoctors } from '../../features/doctors/api'
import { listClinicAppointments, createAppointment, cancelAppointment } from '../../features/appointments/api'
import { formatDateTime } from '../../lib/dateFormat'
import { getErrorMessage } from '../../lib/errors'
import type { AppointmentWithDoctor, DoctorWithDetails } from '../../types/database'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import { APPOINTMENT_STATUS_LABEL, APPOINTMENT_STATUS_TONE } from '../../features/appointments/statusLabels'
import './Appointments.css'

function Appointments() {
  const { profile } = useAuth()
  const [doctors, setDoctors] = useState<DoctorWithDetails[]>([])
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [doctorId, setDoctorId] = useState('')
  const [startAt, setStartAt] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [otkazivanje, setOtkazivanje] = useState<AppointmentWithDoctor | null>(null)
  const [otkazivanjeUTijeku, setOtkazivanjeUTijeku] = useState(false)

  function ucitaj() {
    if (!profile?.clinic_id) return
    setLoading(true)
    Promise.all([listDoctors({ clinicId: profile.clinic_id }), listClinicAppointments(profile.clinic_id)])
      .then(([doctorsData, appointmentsData]) => {
        setDoctors(doctorsData)
        setAppointments(appointmentsData)
      })
      .catch(() => setError('Nije moguće učitati termine.'))
      .finally(() => setLoading(false))
  }

  useEffect(ucitaj, [profile])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setCreateError(null)
    setCreating(true)

    try {
      const iso = new Date(startAt).toISOString()
      await createAppointment(doctorId, iso)
      setDoctorId('')
      setStartAt('')
      setShowForm(false)
      ucitaj()
    } catch (err) {
      setCreateError(getErrorMessage(err, 'Kreiranje termina nije uspjelo.'))
    } finally {
      setCreating(false)
    }
  }

  async function potvrdiOtkazivanje() {
    if (!otkazivanje) return
    setOtkazivanjeUTijeku(true)
    try {
      await cancelAppointment(otkazivanje.id)
      setOtkazivanje(null)
      ucitaj()
    } catch (err) {
      setError(getErrorMessage(err, 'Otkazivanje nije uspjelo.'))
    } finally {
      setOtkazivanjeUTijeku(false)
    }
  }

  if (!profile?.clinic_id) return <p>Vaš korisnički račun nije povezan s nijednom ustanovom.</p>

  return (
    <div>
      <div className="admin-appointments__header">
        <h1>Termini</h1>
        <Button variant="primary" onClick={() => setShowForm((v) => !v)} disabled={doctors.length === 0}>
          <Plus size={16} aria-hidden="true" />
          Novi termin
        </Button>
      </div>

      {doctors.length === 0 && !loading && (
        <p className="admin-appointments__hint">
          Prvo dodajte barem jednog liječnika da biste mogli otvarati termine.
        </p>
      )}

      {showForm && (
        <Card>
          <form className="admin-appointments__form" onSubmit={handleCreate}>
            {createError && <p className="admin-appointments__error">{createError}</p>}

            <div className="field">
              <label htmlFor="doctor_select">Liječnik</label>
              <select
                id="doctor_select"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Odaberite liječnika
                </option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} — {d.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="start_at">Datum i vrijeme</label>
              <input
                id="start_at"
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
              />
            </div>

            <div className="admin-appointments__form-actions">
              <Button type="submit" disabled={creating}>
                {creating ? 'Kreiranje...' : 'Kreiraj termin'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Odustani
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading && <Spinner label="Učitavanje termina..." />}
      {error && <p className="admin-appointments__error">{error}</p>}

      {!loading && appointments.length === 0 && (
        <EmptyState icon={CalendarDays} title="Vaša ustanova još nema otvorenih termina" />
      )}

      <div className="admin-appointments__list">
        {appointments.map((a) => (
          <Card key={a.id}>
            <div className="admin-appointments__row">
              <div>
                <p className="admin-appointments__doctor">{a.doctor_name}</p>
                <p className="admin-appointments__meta">{formatDateTime(a.start_at)}</p>
              </div>
              <div className="admin-appointments__actions">
                <Badge tone={APPOINTMENT_STATUS_TONE[a.status]}>{APPOINTMENT_STATUS_LABEL[a.status]}</Badge>
                {a.status !== 'cancelled' && (
                  <Button variant="secondary" onClick={() => setOtkazivanje(a)}>
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
          title="Otkazivanje termina"
          description={`Jeste li sigurni da želite otkazati termin (${otkazivanje.doctor_name}, ${formatDateTime(otkazivanje.start_at)})? Ako je termin rezerviran, rezervacija će također biti otkazana.`}
          confirmLabel="Otkaži termin"
          onConfirm={potvrdiOtkazivanje}
          onCancel={() => setOtkazivanje(null)}
          busy={otkazivanjeUTijeku}
        />
      )}
    </div>
  )
}

export default Appointments
