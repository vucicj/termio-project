import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import Field from '../../components/Field'
import Button from '../../components/Button'
import './AuthForm.css'

function prevediGresku(poruka: string): string {
  if (poruka.includes('already registered') || poruka.includes('already exists')) {
    return 'Korisnik s ovom e-mail adresom već postoji.'
  }
  if (poruka.includes('Password should be at least')) {
    return 'Lozinka mora imati najmanje 6 znakova.'
  }
  if (poruka.includes('Unable to validate email')) {
    return 'Unesena e-mail adresa nije ispravna.'
  }
  return 'Registracija nije uspjela. Pokušajte ponovno.'
}

function Register() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Lozinke se ne podudaraju.')
      return
    }

    setSubmitting(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    setSubmitting(false)

    if (signUpError) {
      setError(prevediGresku(signUpError.message))
      return
    }

    if (data.session) {
      navigate('/pacijent')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="auth-form">
        <h1>Registracija uspješna</h1>
        <p className="auth-form__success">
          Poslali smo vam e-mail s poveznicom za potvrdu računa. Nakon potvrde se možete
          prijaviti.
        </p>
      </div>
    )
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div>
        <h1>Registracija</h1>
        <p className="auth-form__subtitle">Napravite pacijentski račun u Termio sustavu.</p>
      </div>

      {error && <p className="auth-form__error">{error}</p>}

      <Field
        label="Ime i prezime"
        id="full_name"
        type="text"
        autoComplete="name"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
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
        autoComplete="new-password"
        minLength={6}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Field
        label="Potvrda lozinke"
        id="confirm_password"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Registracija u tijeku...' : 'Registriraj se'}
      </Button>

      <p className="auth-form__footer">
        Već imate račun? <Link to="/prijava">Prijavite se</Link>
      </p>
    </form>
  )
}

export default Register
