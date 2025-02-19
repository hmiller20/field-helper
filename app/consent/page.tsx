"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { v1 as uuidv1 } from "uuid"
import { updateSessionData, getSessionData } from "@/utils/sessionData";
import { Button } from "@/components/ui/button";
import { ToastProvider, Toast, ToastDescription, ToastViewport } from "@/components/ui/toast";
import PDFViewer from "@/components/PDFViewer";

export default function ConsentPage() {
  const [hasReadInfo, setHasReadInfo] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
    if (!navigator.onLine) {
      console.error("You are offline. Please connect to the internet to upload local data.")
      // Optionally, you could display an error toast or alert here.
      return;
    }
    try {
      const sessionData = getSessionData();
      if (!sessionData) {
        console.error("No session data available!");
        return;
      }
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });
      const result = await response.json();
      console.log("Sync result:", result);
      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
      }, 3000);

      // Delete session data after a successful upload so it won't be uploaded again.
      localStorage.removeItem("sessionData");
    } catch (error) {
      console.error("Error syncing session data:", error);
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen relative flex items-center justify-center p-4 bg-background">
        <div className="absolute top-4 right-4">
          <Button
            onClick={handleSync}
            variant="secondary"
            className="text-sm bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 shadow-sm transition-colors"
          >
            Upload Local Data
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
                const sessionId = uuidv1();
                updateSessionData({ sessionId });
                console.log("Generated session ID:", sessionId);
                router.push('/session');
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

