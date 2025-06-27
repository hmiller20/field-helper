import { NextRequest, NextResponse } from 'next/server'
import { supabase, convertToDBFormat } from '@/lib/supabase'

// POST: Save researcher session to Supabase
export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json()
    const dbData = convertToDBFormat(sessionData)
    
    const { data, error } = await supabase
      .from('researcher_sessions')
      .insert([dbData])
      .select()
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Researcher session saved successfully' 
    })
  } catch (error) {
    console.error('Error saving researcher session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save session' },
      { status: 500 }
    )
  }
}

// GET: Retrieve all researcher sessions from Supabase
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const researcherName = searchParams.get('researcher')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    let query = supabase
      .from('researcher_sessions')
      .select('*')
      .order('sign_in_time', { ascending: false })
    
    // Filter by researcher name if provided
    if (researcherName) {
      query = query.eq('researcher_name', researcherName)
    }
    
    // Filter by date range if provided
    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      data,
      count: data.length
    })
  } catch (error) {
    console.error('Error fetching researcher sessions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
} 