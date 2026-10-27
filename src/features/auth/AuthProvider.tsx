import { createContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabaseClient'
import type { Profile } from '../../types/database'

type AuthContextValue = {
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

  if (error) {
    console.error('Greška pri dohvaćanju profila:', error.message)
    return null
  }

  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function init() {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession()

      if (!active) return

      setSession(initialSession)

      if (initialSession) {
        const loadedProfile = await fetchProfile(initialSession.user.id)
        if (active) setProfile(loadedProfile)
      }

      if (active) setLoading(false)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)

      if (newSession) {
        const loadedProfile = await fetchProfile(newSession.user.id)
        setProfile(loadedProfile)
      } else {
        setProfile(null)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function refreshProfile() {
    if (!session) return
    const loadedProfile = await fetchProfile(session.user.id)
    setProfile(loadedProfile)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
