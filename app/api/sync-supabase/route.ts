import { NextResponse } from "next/server";
import { flattenSessionForSupabase } from '@/utils/sessionData';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  if (!supabase) {
    console.error('Supabase client not available - check environment variables');
    return NextResponse.json(
      { success: false, error: 'Database not available' },
      { status: 500 }
    );
  }

  try {
    const data = await request.json();
    // Ensure data is an array of session objects
    const sessions = Array.isArray(data) ? data : [data];

    console.log(`Processing ${sessions.length} session(s) for Supabase sync`);

    const results = [];
    const errors = [];

    for (const session of sessions) {
      try {
        console.log(`Processing session: ${session.id}`);
        
        // Flatten the session data for Supabase
        const flatSession = flattenSessionForSupabase(session);
        
        // Check if session already exists
        const { data: existingSession } = await supabase
          .from('participant_sessions')
          .select('id')
          .eq('id', session.id)
          .single();

        if (existingSession) {
          console.log(`Session ${session.id} already exists in Supabase, skipping`);
          continue;
        }

        // Insert into Supabase
        const { data: insertedData, error } = await supabase
          .from('participant_sessions')
          .insert([flatSession])
          .select();
        
        if (error) {
          console.error(`Supabase insert error for session ${session.id}:`, error);
          errors.push({ sessionId: session.id, error: error.message });
        } else {
          console.log(`Successfully synced session ${session.id} to Supabase`);
          results.push({ sessionId: session.id, supabaseId: insertedData[0]?.id });
        }
      } catch (sessionError) {
        console.error(`Error processing session ${session.id}:`, sessionError);
        errors.push({ 
          sessionId: session.id, 
          error: sessionError instanceof Error ? sessionError.message : 'Unknown error' 
        });
      }
    }

    // Return results
    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `${results.length} sessions synced, ${errors.length} failed`,
        results,
        errors 
      }, { status: 207 }); // 207 Multi-Status for partial success
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${results.length} session(s) to Supabase`,
      results 
    });

  } catch (error) {
    console.error("Error syncing sessions to Supabase:", error);
    let errorMessage = "Failed to sync sessions to Supabase";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error(error.stack);
    }
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
} 