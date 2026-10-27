import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'
import { listDoctors } from '../../features/doctors/api'
import type { DoctorWithDetails } from '../../types/database'
import Card from '../../components/Card'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import './DoctorList.css'

function DoctorList() {
  const [doctors, setDoctors] = useState<DoctorWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [specijalizacija, setSpecijalizacija] = useState('')

  useEffect(() => {
    listDoctors()
      .then(setDoctors)
      .catch(() => setError('Nije moguće učitati popis liječnika. Pokušajte ponovno kasnije.'))
      .finally(() => setLoading(false))
  }, [])

  const specijalizacije = useMemo(
    () => Array.from(new Set(doctors.map((d) => d.specialization))).sort(),
    [doctors],
  )

  const prikazaniLijecnici = specijalizacija
    ? doctors.filter((d) => d.specialization === specijalizacija)
    : doctors

  return (
    <div>
      <h1>Liječnici</h1>

      {loading && <Spinner label="Učitavanje liječnika..." />}
      {error && <p className="doctor-list__error">{error}</p>}

      {!loading && !error && (
        <>
          {specijalizacije.length > 0 && (
            <div className="doctor-list__filter">
              <label htmlFor="specijalizacija">Specijalizacija</label>
              <select
                id="specijalizacija"
                value={specijalizacija}
                onChange={(e) => setSpecijalizacija(e.target.value)}
              >
                <option value="">Sve specijalizacije</option>
                {specijalizacije.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {prikazaniLijecnici.length === 0 && (
            <EmptyState icon={Stethoscope} title="Nema liječnika za odabrane kriterije" />
          )}

          <div className="doctor-list">
            {prikazaniLijecnici.map((doctor) => (
              <Link key={doctor.id} to={`/lijecnici/${doctor.id}`} className="doctor-list__link">
                <Card>
                  <h2 className="doctor-list__name">{doctor.full_name}</h2>
                  <p className="doctor-list__specialization">{doctor.specialization}</p>
                  <p className="doctor-list__clinic">{doctor.clinic_name}</p>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default DoctorList
