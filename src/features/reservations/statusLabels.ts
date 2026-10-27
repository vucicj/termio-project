import type { ReservationStatus } from '../../types/database'

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: 'Na čekanju',
  confirmed: 'Potvrđeno',
  cancelled: 'Otkazano',
}

export const RESERVATION_STATUS_TONE: Record<ReservationStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
}
