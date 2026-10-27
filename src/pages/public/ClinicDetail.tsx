import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapPin, Phone, Stethoscope } from 'lucide-react'
import { getClinic } from '../../features/clinics/api'
import { listDoctors } from '../../features/doctors/api'
import type { Clinic, DoctorWithDetails } from '../../types/database'
import Card from '../../components/Card'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import './ClinicDetail.css'

function ClinicDetail() {
  const { id } = useParams<{ id: string }>()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [doctors, setDoctors] = useState<DoctorWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    Promise.all([getClinic(id), listDoctors({ clinicId: id })])
      .then(([clinicData, doctorsData]) => {
        setClinic(clinicData)
        setDoctors(doctorsData)
      })
      .catch(() => setError('Nije moguće učitati podatke o ustanovi.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner label="Učitavanje ustanove..." />
  if (error) return <p className="clinic-detail__error">{error}</p>
  if (!clinic) return <p>Ustanova nije pronađena.</p>

  return (
    <div>
      <h1>{clinic.name}</h1>
      <div className="clinic-detail__meta">
        <span>
          <MapPin size={16} aria-hidden="true" /> {clinic.address}
        </span>
        {clinic.phone && (
          <span>
            <Phone size={16} aria-hidden="true" /> {clinic.phone}
          </span>
        )}
      </div>

      <h2 className="clinic-detail__section-title">Liječnici</h2>

      {doctors.length === 0 && (
        <EmptyState icon={Stethoscope} title="Ova ustanova trenutno nema unesenih liječnika" />
      )}

      <div className="clinic-detail__doctors">
        {doctors.map((doctor) => (
          <Link key={doctor.id} to={`/lijecnici/${doctor.id}`} className="clinic-detail__doctor-link">
            <Card>
              <h3>{doctor.full_name}</h3>
              <p>{doctor.specialization}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ClinicDetail
