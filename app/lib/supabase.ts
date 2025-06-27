// research assistant database configuration

import { createClient } from '@supabase/supabase-js'

// These will need to be set in your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for type safety
export interface ResearcherSessionDB {
  id: string
  researcher_name: string
  sign_in_time: string // ISO string
  sign_out_time?: string // ISO string
  date: string // YYYY-MM-DD
  duration_hours?: number
  sessions_completed?: number // Number of sessions completed during this shift
  created_at?: string
}

// Function to convert our local ResearcherSession to DB format
export const convertToDBFormat = (session: any): ResearcherSessionDB => {
  const duration = session.signOutTime 
    ? (session.signOutTime - session.signInTime) / (1000 * 60 * 60)
    : null

  // Convert EST timestamps to ISO strings with timezone info
  const signInDate = new Date(session.signInTime);
  const signInEST = signInDate.toLocaleString('sv-SE', { timeZone: 'America/New_York' }) + '-05:00'; // Approximate EST format
  
  const signOutEST = session.signOutTime 
    ? new Date(session.signOutTime).toLocaleString('sv-SE', { timeZone: 'America/New_York' }) + '-05:00'
    : undefined;

  return {
    id: session.id,
    researcher_name: session.researcherName,
    sign_in_time: signInEST,
    sign_out_time: signOutEST,
    date: session.date,
    duration_hours: duration ? parseFloat(duration.toFixed(2)) : undefined,
    sessions_completed: session.sessionsCompleted || 0,
  }
} 