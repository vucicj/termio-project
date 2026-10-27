import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import type { UserRole } from '../../types/database'
import Field from '../../components/Field'
import Button from '../../components/Button'
import './AuthForm.css'

const PUTANJA_PO_ULOZI: Record<UserRole, string> = {
  patient: '/pacijent',
  doctor: '/lijecnik',
  clinic_admin: '/admin',
}

function prevediGresku(poruka: string): string {
  if (poruka.includes('Invalid login credentials')) {
    return 'Neispravna e-mail adresa ili lozinka.'
  }
  if (poruka.includes('Email not confirmed')) {
    return 'Potrebno je potvrditi e-mail adresu prije prijave.'
  }
  return 'Prijava nije uspjela. Pokušajte ponovno.'
}

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(prevediGresku(signInError.message))
      setSubmitting(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single<{ role: UserRole }>()

    setSubmitting(false)
    navigate(profile ? PUTANJA_PO_ULOZI[profile.role] : '/pacijent')
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div>
        <h1>Prijava</h1>
        <p className="auth-form__subtitle">Prijavite se u svoj Termio račun.</p>
      </div>

      {error && <p className="auth-form__error">{error}</p>}

      <Field
        label="E-mail adresa"
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Field
        label="Lozinka"
        id="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Prijava u tijeku...' : 'Prijavi se'}
      </Button>

      <p className="auth-form__footer">
        Nemate račun? <Link to="/registracija">Registrirajte se</Link>
      </p>
    </form>
  )
}

export default Login
