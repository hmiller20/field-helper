"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { v1 as uuidv1 } from "uuid"
import { updateSessionData, getSessionData } from "@/utils/sessionData";
import { Button } from "@/components/ui/button";

export default function ConsentPage() {
  const [hasReadInfo, setHasReadInfo] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
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
    } catch (error) {
      console.error("Error syncing session data:", error);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <Button
          onClick={handleSync}
          variant="secondary"
          className="text-sm"
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
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Information Sheet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Study Information</h2>
                <p>[Your study information and consent details go here]</p>
                {/* Add more sections as needed */}
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
  )
}

