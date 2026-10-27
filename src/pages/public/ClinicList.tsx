import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, MapPin } from 'lucide-react'
import { listClinics } from '../../features/clinics/api'
import type { Clinic } from '../../types/database'
import Card from '../../components/Card'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import './ClinicList.css'

function ClinicList() {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listClinics()
      .then(setClinics)
      .catch(() => setError('Nije moguće učitati popis ustanova. Pokušajte ponovno kasnije.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1>Zdravstvene ustanove</h1>

      {loading && <Spinner label="Učitavanje ustanova..." />}
      {error && <p className="clinic-list__error">{error}</p>}

      {!loading && !error && clinics.length === 0 && (
        <EmptyState icon={Building2} title="Trenutno nema dostupnih ustanova" />
      )}

      <div className="clinic-list">
        {clinics.map((clinic) => (
          <Link key={clinic.id} to={`/ustanove/${clinic.id}`} className="clinic-list__link">
            <Card>
              <h2 className="clinic-list__name">{clinic.name}</h2>
              <p className="clinic-list__address">
                <MapPin size={16} aria-hidden="true" />
                {clinic.address}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ClinicList
