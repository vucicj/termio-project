import { supabase } from '../../lib/supabaseClient'
import type {
  Reservation,
  ReservationWithDetails,
  ReservationForDoctor,
  ReservationForAdmin,
} from '../../types/database'

type ReservationRow = {
  id: string
  appointment_id: string
  patient_id: string
  status: Reservation['status']
  created_at: string
  appointments: {
    start_at: string
    doctor_id: string
    doctors: {
      specialization: string
      profiles: { full_name: string } | null
      clinics: { name: string } | null
    } | null
  } | null
}

function mapReservation(row: ReservationRow): ReservationWithDetails {
  const doctor = row.appointments?.doctors

  return {
    id: row.id,
    appointment_id: row.appointment_id,
    patient_id: row.patient_id,
    status: row.status,
    created_at: row.created_at,
    start_at: row.appointments?.start_at ?? '',
    doctor_id: row.appointments?.doctor_id ?? '',
    doctor_name: doctor?.profiles?.full_name ?? 'Nepoznat liječnik',
    specialization: doctor?.specialization ?? '',
    clinic_name: doctor?.clinics?.name ?? 'Nepoznata ustanova',
  }
}

export async function listMyReservations(): Promise<ReservationWithDetails[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select(
      'id, appointment_id, patient_id, status, created_at, appointments(start_at, doctor_id, doctors(specialization, profiles(full_name), clinics(name)))',
    )
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as unknown as ReservationRow[]).map(mapReservation)
}

export async function bookAppointment(appointmentId: string): Promise<Reservation> {
  const { data, error } = await supabase.rpc('book_appointment', {
    p_appointment_id: appointmentId,
  })

  if (error) throw error
  return data
}

export async function cancelReservation(reservationId: string): Promise<Reservation> {
  const { data, error } = await supabase.rpc('cancel_reservation', {
    p_reservation_id: reservationId,
  })

  if (error) throw error
  return data
}

export async function confirmReservation(reservationId: string): Promise<Reservation> {
  const { data, error } = await supabase.rpc('confirm_reservation', {
    p_reservation_id: reservationId,
  })

  if (error) throw error
  return data
}

type DoctorReservationRow = {
  id: string
  appointment_id: string
  patient_id: string
  status: Reservation['status']
  created_at: string
  appointments: { start_at: string; doctor_id: string } | null
  profiles: { full_name: string } | null
}

function mapDoctorReservation(row: DoctorReservationRow): ReservationForDoctor {
  return {
    id: row.id,
    appointment_id: row.appointment_id,
    patient_id: row.patient_id,
    status: row.status,
    created_at: row.created_at,
    start_at: row.appointments?.start_at ?? '',
    patient_name: row.profiles?.full_name ?? 'Nepoznat pacijent',
  }
}

export async function listDoctorReservations(doctorId: string): Promise<ReservationForDoctor[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select('id, appointment_id, patient_id, status, created_at, appointments!inner(start_at, doctor_id), profiles(full_name)')
    .eq('appointments.doctor_id', doctorId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as unknown as DoctorReservationRow[]).map(mapDoctorReservation)
}

type AdminReservationRow = {
  id: string
  appointment_id: string
  patient_id: string
  status: Reservation['status']
  created_at: string
  appointments: {
    start_at: string
    doctor_id: string
    doctors: { profiles: { full_name: string } | null } | null
  } | null
  profiles: { full_name: string } | null
}

export async function listClinicReservations(clinicId: string): Promise<ReservationForAdmin[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select(
      'id, appointment_id, patient_id, status, created_at, appointments!inner(start_at, doctor_id, doctors!inner(clinic_id, profiles(full_name))), profiles(full_name)',
    )
    .eq('appointments.doctors.clinic_id', clinicId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data as unknown as AdminReservationRow[]).map((row) => ({
    id: row.id,
    appointment_id: row.appointment_id,
    patient_id: row.patient_id,
    status: row.status,
    created_at: row.created_at,
    start_at: row.appointments?.start_at ?? '',
    doctor_id: row.appointments?.doctor_id ?? '',
    doctor_name: row.appointments?.doctors?.profiles?.full_name ?? 'Nepoznat liječnik',
    patient_name: row.profiles?.full_name ?? 'Nepoznat pacijent',
  }))
}
