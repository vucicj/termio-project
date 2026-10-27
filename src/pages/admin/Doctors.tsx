import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Users, Plus } from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'
import { listDoctors, adminAddDoctor, updateDoctorSpecialization } from '../../features/doctors/api'
import { getErrorMessage } from '../../lib/errors'
import type { DoctorWithDetails } from '../../types/database'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Field from '../../components/Field'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import './Doctors.css'

function Doctors() {
  const { profile } = useAuth()
  const [doctors, setDoctors] = useState<DoctorWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  const [showAddForm, setShowAddForm] = useState(false)
  const [email, setEmail] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editError, setEditError] = useState<string | null>(null)

  function ucitaj() {
    if (!profile?.clinic_id) return
    setLoading(true)
    listDoctors({ clinicId: profile.clinic_id })
      .then(setDoctors)
      .finally(() => setLoading(false))
  }

  useEffect(ucitaj, [profile])

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    setAddError(null)
    setAdding(true)

    try {
      await adminAddDoctor(email, specialization)
      setEmail('')
      setSpecialization('')
      setShowAddForm(false)
      ucitaj()
    } catch (err) {
      setAddError(getErrorMessage(err, 'Dodavanje liječnika nije uspjelo.'))
    } finally {
      setAdding(false)
    }
  }

  function pokreniUredivanje(doctor: DoctorWithDetails) {
    setEditingId(doctor.id)
    setEditValue(doctor.specialization)
    setEditError(null)
  }

  async function spremiUredivanje(doctorId: string) {
    setEditError(null)
    try {
      await updateDoctorSpecialization(doctorId, editValue)
      setEditingId(null)
      ucitaj()
    } catch {
      setEditError('Spremanje nije uspjelo.')
    }
  }

  if (!profile?.clinic_id) return <p>Vaš korisnički račun nije povezan s nijednom ustanovom.</p>

  return (
    <div>
      <div className="admin-doctors__header">
        <h1>Liječnici</h1>
        <Button variant="primary" onClick={() => setShowAddForm((v) => !v)}>
          <Plus size={16} aria-hidden="true" />
          Dodaj liječnika
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <form className="admin-doctors__add-form" onSubmit={handleAdd}>
            <p className="admin-doctors__add-hint">
              Osoba se mora prethodno sama registrirati kao pacijent: unesite njezinu e-mail adresu da je
              promovirate u liječnika.
            </p>
            {addError && <p className="admin-doctors__error">{addError}</p>}
            <Field
              label="E-mail postojećeg korisnika"
              id="doctor_email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Field
              label="Specijalizacija"
              id="doctor_specialization"
              type="text"
              required
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />
            <div className="admin-doctors__add-actions">
              <Button type="submit" disabled={adding}>
                {adding ? 'Dodavanje...' : 'Dodaj'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>
                Odustani
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading && <Spinner label="Učitavanje liječnika..." />}

      {!loading && doctors.length === 0 && (
        <EmptyState icon={Users} title="Vaša ustanova još nema unesenih liječnika" />
      )}

      <div className="admin-doctors__list">
        {doctors.map((doctor) => (
          <Card key={doctor.id}>
            <div className="admin-doctors__row">
              <div>
                <p className="admin-doctors__name">{doctor.full_name}</p>
                {editingId === doctor.id ? (
                  <div className="admin-doctors__edit">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      aria-label="Specijalizacija"
                    />
                    <Button variant="primary" onClick={() => spremiUredivanje(doctor.id)}>
                      Spremi
                    </Button>
                    <Button variant="secondary" onClick={() => setEditingId(null)}>
                      Odustani
                    </Button>
                  </div>
                ) : (
                  <p className="admin-doctors__specialization">{doctor.specialization}</p>
                )}
                {editError && editingId === doctor.id && <p className="admin-doctors__error">{editError}</p>}
              </div>
              {editingId !== doctor.id && (
                <Button variant="secondary" onClick={() => pokreniUredivanje(doctor)}>
                  Uredi
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Doctors
