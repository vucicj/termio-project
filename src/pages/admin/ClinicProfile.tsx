import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../../features/auth/useAuth'
import { getClinic, updateClinic } from '../../features/clinics/api'
import type { Clinic } from '../../types/database'
import Card from '../../components/Card'
import Field from '../../components/Field'
import Button from '../../components/Button'
import Spinner from '../../components/Spinner'
import './ClinicProfile.css'

function ClinicProfile() {
  const { profile } = useAuth()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!profile?.clinic_id) {
      setLoading(false)
      return
    }

    getClinic(profile.clinic_id)
      .then((data) => {
        setClinic(data)
        if (data) {
          setName(data.name)
          setAddress(data.address)
          setPhone(data.phone ?? '')
        }
      })
      .finally(() => setLoading(false))
  }, [profile])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!clinic) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await updateClinic(clinic.id, { name, address, phone: phone || null })
      setSuccess(true)
    } catch {
      setError('Spremanje nije uspjelo. Pokušajte ponovno.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner label="Učitavanje podataka ustanove..." />
  if (!profile?.clinic_id || !clinic) return <p>Vaš korisnički račun nije povezan s nijednom ustanovom.</p>

  return (
    <div>
      <h1>Podaci ustanove</h1>

      <Card>
        <form className="clinic-profile-form" onSubmit={handleSubmit}>
          {error && <p className="clinic-profile-form__error">{error}</p>}
          {success && <p className="clinic-profile-form__success">Podaci su uspješno spremljeni.</p>}

          <Field label="Naziv ustanove" id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
          <Field label="Adresa" id="address" type="text" required value={address} onChange={(e) => setAddress(e.target.value)} />
          <Field label="Telefon" id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />

          <Button type="submit" disabled={saving}>
            {saving ? 'Spremanje...' : 'Spremi promjene'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default ClinicProfile
