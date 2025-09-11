import { NextResponse } from "next/server";
import { flattenSessionForSupabase, Session } from '@/utils/sessionData';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// Function to upload silhouette images to Supabase Storage
async function processSilhouetteImages(session: Session) {
  console.log(`DEBUG: processSilhouetteImages called for session ${session.id}`);
  
  if (!supabase) {
    console.warn('Supabase not available for image upload');
    return session;
  }

  const processedSession = { ...session };
  console.log(`DEBUG: Processing ${processedSession.blocks?.length || 0} blocks`);
  
  // Process each block's silhouette image
  for (let i = 0; i < processedSession.blocks.length; i++) {
    const block = processedSession.blocks[i];
    console.log(`DEBUG: Block ${i} - blockType: ${block.blockType}, has silhouettePngUrl: ${!!block.drawing?.silhouettePngUrl}, starts with base64: ${block.drawing?.silhouettePngUrl?.startsWith('data:image/png;base64,')}`);
    
    
    if (block.drawing?.silhouettePngUrl && block.drawing.silhouettePngUrl.startsWith('data:image/png;base64,')) {
      try {
        console.log(`Uploading silhouette for session ${session.id}, block ${i+1} (${block.blockType})`);
        
        // Extract base64 data
        const base64Data = block.drawing.silhouettePngUrl.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Create filename: sessionId_blockType_silhouette.png
        const filename = `${session.id}_${block.blockType}_silhouette.png`;
        const filePath = `silhouettes/${filename}`;
        
        // Upload to Supabase Storage using admin client to bypass RLS
        const { error } = await (supabaseAdmin || supabase).storage
          .from('drawings')
          .upload(filePath, buffer, {
            contentType: 'image/png',
            upsert: true
          });
        
        if (error) {
          console.error(`Failed to upload silhouette for ${session.id}-${block.blockType}:`, error);
        } else {
          // Get public URL
          const { data: { publicUrl } } = (supabaseAdmin || supabase).storage
            .from('drawings')
            .getPublicUrl(filePath);
          
          // Replace base64 URL with public URL
          processedSession.blocks[i].drawing!.silhouettePngUrl = publicUrl;
          console.log(`Successfully uploaded silhouette: ${publicUrl}`);
        }
      } catch (error) {
        console.error(`Error processing silhouette for ${session.id}-${block.blockType}:`, error);
      }
    }
  }
  
  return processedSession;
}

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
        
        // Always process silhouette images (even if session exists in DB)
        const processedSession = await processSilhouetteImages(session);
        
        // Check if session already exists in database
        const { data: existingSession } = await supabase
          .from('participant_sessions')
          .select('id')
          .eq('id', session.id)
          .single();

        if (existingSession) {
          console.log(`Session ${session.id} already exists in Supabase database, but silhouettes were processed`);
          results.push({ sessionId: session.id, supabaseId: existingSession.id, status: 'silhouettes_processed' });
          continue;
        }
        
        // Flatten the session data for Supabase
        const flatSession = flattenSessionForSupabase(processedSession);

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