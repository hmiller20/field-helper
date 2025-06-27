// research assistant database configuration

import { createClient } from '@supabase/supabase-js'

// These will need to be set in your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for type safety
export interface ResearcherSessionDB {
  researcher_name: string
  sign_in_time: string // Time only: "09:51:10"
  sign_out_time?: string // Time only: "17:30:45"
  date: string // YYYY-MM-DD
  duration_hours?: number
  sessions_completed?: number // Number of sessions completed during this shift
}

// Type for the input session object
interface ResearcherSessionInput {
  researcherName: string
  signInTime: number
  signOutTime?: number
  date: string
  sessionsCompleted?: number
}

  // Function to convert our local ResearcherSession to DB format
export const convertToDBFormat = (session: ResearcherSessionInput): ResearcherSessionDB => {
  const duration = session.signOutTime 
    ? (session.signOutTime - session.signInTime) / (1000 * 60 * 60)
    : null

  // Convert timestamps to time-only format (HH:MM:SS)
  const toTimeString = (timestamp: number): string => {
    // Create a new date object
    const utcDate = new Date(timestamp);
    
    // Get EST time using toLocaleString with timezone
    const estTime = utcDate.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    // This returns format "HH:MM:SS"
    return estTime;
  };

  const signInTime = toTimeString(session.signInTime);
  const signOutTime = session.signOutTime ? toTimeString(session.signOutTime) : undefined;

  // Debug logging to see what we're sending to Supabase
  console.log('Converting timestamps for Supabase:');
  console.log('Original signInTime:', session.signInTime, '→', new Date(session.signInTime).toString());
  console.log('Time-only signInTime:', signInTime);
  if (session.signOutTime) {
    console.log('Original signOutTime:', session.signOutTime, '→', new Date(session.signOutTime).toString());
    console.log('Time-only signOutTime:', signOutTime);
  }

  return {
    researcher_name: session.researcherName,
    sign_in_time: signInTime,
    sign_out_time: signOutTime,
    date: session.date,
    duration_hours: duration ? parseFloat(duration.toFixed(2)) : undefined,
    sessions_completed: session.sessionsCompleted || 0,
  }
} 