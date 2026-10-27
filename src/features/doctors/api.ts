import { supabase } from '../../lib/supabaseClient'
import type { Doctor, DoctorWithDetails } from '../../types/database'

type DoctorRow = {
  id: string
  user_id: string
  clinic_id: string
  specialization: string
  created_at: string
  profiles: { full_name: string } | null
  clinics: { name: string } | null
}

function mapDoctor(row: DoctorRow): DoctorWithDetails {
  return {
    id: row.id,
    user_id: row.user_id,
    clinic_id: row.clinic_id,
    specialization: row.specialization,
    created_at: row.created_at,
    full_name: row.profiles?.full_name ?? 'Nepoznat liječnik',
    clinic_name: row.clinics?.name ?? 'Nepoznata ustanova',
  }
}

export async function listDoctors(options?: {
  clinicId?: string
  specialization?: string
}): Promise<DoctorWithDetails[]> {
  let query = supabase
    .from('doctors')
    .select('id, user_id, clinic_id, specialization, created_at, profiles(full_name), clinics(name)')

  if (options?.clinicId) {
    query = query.eq('clinic_id', options.clinicId)
  }

  if (options?.specialization) {
    query = query.eq('specialization', options.specialization)
  }

  const { data, error } = await query
  if (error) throw error

  return (data as unknown as DoctorRow[]).map(mapDoctor)
}

export async function getDoctor(id: string): Promise<DoctorWithDetails | null> {
  const { data, error } = await supabase
    .from('doctors')
    .select('id, user_id, clinic_id, specialization, created_at, profiles(full_name), clinics(name)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return mapDoctor(data as unknown as DoctorRow)
}

export async function adminAddDoctor(email: string, specialization: string): Promise<Doctor> {
  const { data, error } = await supabase.rpc('admin_add_doctor', {
    p_email: email,
    p_specialization: specialization,
  })

  if (error) throw error
  return data
}

export async function updateDoctorSpecialization(doctorId: string, specialization: string): Promise<void> {
  const { error } = await supabase.from('doctors').update({ specialization }).eq('id', doctorId)
  if (error) throw error
}
