export type UserRole = 'patient' | 'doctor' | 'clinic_admin'
export type AppointmentStatus = 'available' | 'booked' | 'cancelled'
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled'

export type Profile = {
  id: string
  full_name: string
  email: string
  role: UserRole
  clinic_id: string | null
  created_at: string
}

export type Clinic = {
  id: string
  name: string
  address: string
  phone: string | null
  created_at: string
}

export type Doctor = {
  id: string
  user_id: string
  clinic_id: string
  specialization: string
  created_at: string
}

export type Appointment = {
  id: string
  doctor_id: string
  start_at: string
  status: AppointmentStatus
  created_at: string
}

export type Reservation = {
  id: string
  appointment_id: string
  patient_id: string
  status: ReservationStatus
  created_at: string
}

export const APPOINTMENT_DURATION_MINUTES = 30

export type DoctorWithDetails = Doctor & {
  full_name: string
  clinic_name: string
}

export type ReservationWithDetails = Reservation & {
  start_at: string
  doctor_id: string
  doctor_name: string
  specialization: string
  clinic_name: string
}

export type ReservationForDoctor = Reservation & {
  start_at: string
  patient_name: string
}

export type AppointmentWithDoctor = Appointment & {
  doctor_name: string
}

export type ReservationForAdmin = Reservation & {
  start_at: string
  doctor_id: string
  doctor_name: string
  patient_name: string
}
