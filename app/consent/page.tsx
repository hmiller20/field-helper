"use client"

export const dynamic = 'force-static'; // important: makes this build to static HTML

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { v1 as uuidv1 } from "uuid"
import { updateSessionData, getSessionData, getCurrentSession, clearAllSessionData, assignNameColors, assignCharacterConditions, initializeViolationCounts, syncSessionsToSupabase, generateChronologicalSessionId, generateTestSessionId } from "@/utils/sessionData";
import { Button } from "@/components/ui/button";
import { ToastProvider, Toast, ToastDescription, ToastViewport } from "@/components/ui/toast";
import PDFViewer from "@/components/PDFViewer";
import ResearcherSignIn from "@/components/ResearcherSignIn";

export default function ConsentPage() {
  const [hasReadInfo, setHasReadInfo] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const router = useRouter()

  // Update session count on component mount and when storage changes
  React.useEffect(() => {
    const updateSessionCount = () => {
      const sessions = getSessionData();
      setSessionCount(sessions.length);
    };
    
    updateSessionCount();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      updateSessionCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [])

  const handleSync = async () => {
    if (isUploading) {
      console.log("Upload already in progress");
      return;
    }

    if (!navigator.onLine) {
      console.error("You are offline. Please connect to the internet to upload local data.")
      return;
    }

    try {
      setIsUploading(true);
      const sessionData = getSessionData();
      if (!sessionData || sessionData.length === 0) {
        console.error("No session data available!");
        return;
      }

      console.log(`Starting sync for ${sessionData.length} session(s)...`);

      // First upload images to S3 via the sync API (which now only handles S3 uploads)
      console.log("Uploading images to S3...");
      const s3Response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });

      if (!s3Response.ok) {
        throw new Error(`S3 upload failed with status: ${s3Response.status}`);
      }

      const s3Result = await s3Response.json();
      console.log("S3 upload result:", s3Result);

      // Use the updated sessions with S3 URLs from S3 upload
      const updatedSessionData = s3Result.updatedSessions || sessionData;

      // Then sync to Supabase with updated data that includes S3 URLs
      console.log("Syncing to Supabase with updated data...");
      const supabaseResult = await syncSessionsToSupabase(updatedSessionData);
      
      if (!supabaseResult.success) {
        throw new Error(`Supabase sync failed: ${supabaseResult.message}`);
      }

      console.log("Supabase sync result:", supabaseResult.message);
      console.log("Upload and sync completed successfully!");
      
      // Only clear all session data after confirming both syncs are successful
      clearAllSessionData();
      
      // Update session count to reflect cleared data
      setSessionCount(0);
      
      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
      }, 3000);
    } catch (error) {
      console.error("Error syncing session data:", error);
      // Don't clear localStorage on error to allow retry
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen relative flex items-center justify-center p-4 bg-background">
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <ResearcherSignIn />
          <Button
            onClick={handleSync}
            variant="secondary"
            className="text-sm bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 shadow-sm transition-colors"
            disabled={isUploading || sessionCount === 0}
          >
            {isUploading ? "Uploading..." : `Upload Local Data (${sessionCount})`}
          </Button>
        </div>

        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 flex flex-col items-center gap-8">
            <p className="text-center text-lg sm:text-xl leading-relaxed">
              Please read the information sheet by pressing the button below. After you have read the information sheet,
              please provide your consent by pressing the continue button.
            </p>

            <Dialog
              onOpenChange={(open) => {
                if (!open) setHasReadInfo(true)
              }}
            >
              <DialogTrigger asChild>
                <Button className="w-48 h-16 text-xl bg-[#ffeeb2] hover:bg-[#ffe699] text-black" variant="secondary">
                  Consent Form
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Information Sheet</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                  <PDFViewer pdfUrl="/consent-form.pdf" />
                </div>
              </DialogContent>
            </Dialog>

            <Button
              className="w-48 h-16 text-xl bg-[#c1e6c1] hover:bg-[#a8dba8] text-black"
              disabled={!hasReadInfo}
              variant="secondary"
              onClick={() => {
                // Get the most recent session to check if it's a test
                const sessionData = getSessionData();
                const mostRecentSession = sessionData[sessionData.length - 1];
                const isTestSession = mostRecentSession?.sessionTest || false;
                
                // Generate appropriate session ID
                const chronologicalSessionId = isTestSession 
                  ? generateTestSessionId() 
                  : generateChronologicalSessionId();
                
                // Generate UUID for internal use
                const internalId = uuidv1();
                
                console.log("=== CONSENT: Generated IDs ===");
                console.log("Internal UUID:", internalId);
                console.log("Chronological Session ID:", chronologicalSessionId);
                console.log("Is test session:", isTestSession);
                
                // Create session with both IDs
                updateSessionData({ 
                  id: internalId,
                  sessionId: chronologicalSessionId
                });
                
                // Then assign name colors and character conditions
                assignNameColors();
                assignCharacterConditions();
                
                // Initialize violation counts for this session
                initializeViolationCounts();
                
                // Verify what was actually stored
                const currentSession = getCurrentSession();
                console.log("=== CONSENT: getCurrentSession result ===", currentSession);
                console.log("=== CONSENT: Internal ID ===", currentSession?.id);
                console.log("=== CONSENT: Session ID ===", currentSession?.sessionId);
                
                router.push('/exampleDrawing');
              }}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
      <Toast 
        open={toastOpen} 
        onOpenChange={setToastOpen}
        duration={3000}
        className="bg-green-100 border border-green-300 flex items-center justify-center w-[350px]"
      >
        <ToastDescription className="text-xl text-green-800 w-full text-center">
          Data upload successful!
        </ToastDescription>
      </Toast>
      <ToastViewport className="fixed top-4 left-1/2 transform -translate-x-1/2" />
    </ToastProvider>
  )
}

