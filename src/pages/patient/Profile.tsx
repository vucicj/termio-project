import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../../features/auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import Card from '../../components/Card'
import Field from '../../components/Field'
import Button from '../../components/Button'
import Spinner from '../../components/Spinner'
import './Profile.css'

function Profile() {
  const { profile, refreshProfile, loading } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (loading) return <Spinner label="Učitavanje profila..." />
  if (!profile) return <p>Profil nije pronađen.</p>

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile!.id)

    setSaving(false)

    if (updateError) {
      setError('Spremanje nije uspjelo. Pokušajte ponovno.')
      return
    }

    await refreshProfile()
    setSuccess(true)
  }

  return (
    <div>
      <h1>Moj profil</h1>

      <Card>
        <form className="profile-form" onSubmit={handleSubmit}>
          {error && <p className="profile-form__error">{error}</p>}
          {success && <p className="profile-form__success">Podaci su uspješno spremljeni.</p>}

          <Field
            label="Ime i prezime"
            id="full_name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Field label="E-mail adresa" id="email" type="email" value={profile.email} disabled readOnly />

          <Button type="submit" disabled={saving}>
            {saving ? 'Spremanje...' : 'Spremi promjene'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default Profile
