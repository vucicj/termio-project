import { supabase } from '../../lib/supabaseClient'
import type { Appointment, AppointmentWithDoctor } from '../../types/database'

export async function listAvailableAppointments(doctorId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('status', 'available')
    .gt('start_at', new Date().toISOString())
    .order('start_at')

  if (error) throw error
  return data
}

type AppointmentRow = {
  id: string
  doctor_id: string
  start_at: string
  status: Appointment['status']
  created_at: string
  doctors: { profiles: { full_name: string } | null } | null
}

export async function listClinicAppointments(clinicId: string): Promise<AppointmentWithDoctor[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, doctor_id, start_at, status, created_at, doctors!inner(clinic_id, profiles(full_name))')
    .eq('doctors.clinic_id', clinicId)
    .order('start_at')

  if (error) throw error

  return (data as unknown as AppointmentRow[]).map((row) => ({
    id: row.id,
    doctor_id: row.doctor_id,
    start_at: row.start_at,
    status: row.status,
    created_at: row.created_at,
    doctor_name: row.doctors?.profiles?.full_name ?? 'Nepoznat liječnik',
  }))
}

export async function createAppointment(doctorId: string, startAt: string): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert({ doctor_id: doctorId, start_at: startAt })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function cancelAppointment(appointmentId: string): Promise<Appointment> {
  const { data, error } = await supabase.rpc('cancel_appointment', {
    p_appointment_id: appointmentId,
  })

  if (error) throw error
  return data
}

export async function listDoctorAppointments(doctorId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('start_at')

  if (error) throw error
  return data
}
