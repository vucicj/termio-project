import { supabase } from '../../lib/supabaseClient'
import type { Clinic } from '../../types/database'

export async function listClinics(): Promise<Clinic[]> {
  const { data, error } = await supabase.from('clinics').select('*').order('name')

  if (error) throw error
  return data
}

export async function getClinic(id: string): Promise<Clinic | null> {
  const { data, error } = await supabase.from('clinics').select('*').eq('id', id).maybeSingle()

  if (error) throw error
  return data
}

export async function updateClinic(
  id: string,
  changes: Pick<Clinic, 'name' | 'address' | 'phone'>,
): Promise<void> {
  const { error } = await supabase.from('clinics').update(changes).eq('id', id)
  if (error) throw error
}
