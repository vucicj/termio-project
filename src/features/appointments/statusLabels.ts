import type { AppointmentStatus } from '../../types/database'

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  available: 'Slobodan',
  booked: 'Zauzet',
  cancelled: 'Otkazan',
}

export const APPOINTMENT_STATUS_TONE: Record<AppointmentStatus, 'success' | 'warning' | 'danger'> = {
  available: 'success',
  booked: 'warning',
  cancelled: 'danger',
}
