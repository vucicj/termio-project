import { useContext } from 'react'
import { AuthContext } from './AuthProvider'

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth se mora koristiti unutar AuthProvider komponente.')
  }

  return context
}
