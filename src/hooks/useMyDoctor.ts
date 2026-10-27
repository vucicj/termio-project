import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../features/auth/useAuth'
import type { Doctor } from '../types/database'

/** Dohvaća zapis liječnika (tablica 'doctors') povezan s trenutno prijavljenim korisnikom. */
export function useMyDoctor() {
  const { profile } = useAuth()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) {
      setLoading(false)
      return
    }

    async function ucitaj() {
      const { data } = await supabase.from('doctors').select('*').eq('user_id', profile!.id).maybeSingle()
      setDoctor(data)
      setLoading(false)
    }

    ucitaj()
  }, [profile])

  return { doctor, loading }
}
