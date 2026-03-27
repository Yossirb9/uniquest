import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

export async function fetchLeaderboard() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false })
    .limit(10)
  if (error) { console.error(error); return [] }
  return data || []
}

export async function submitScore({ player_name, score, gems, level, time_seconds }) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('scores')
    .insert([{ player_name, score, gems, level, time_seconds }])
    .select()
  if (error) { console.error(error); return null }
  return data?.[0] || null
}
