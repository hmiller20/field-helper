"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { updateSessionData, getSessionData } from "@/utils/sessionData";

export default function ExperimenterPage() {
  const [experimenter, setExperimenter] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Sample list of experimenters; update as needed.
  const experimentersList = ["Anna", "Arthur", "Harrison", "Lily", "Olivia", "Rafa", "Shelby", "Sophie", "Tommaso"];

  // Handle button click: validate and record data to local storage and navigate to consent screen.
  const handleSave = () => {
    if (!experimenter) {
      setError("Please select an experimenter");
      return;
    }
    if (!sessionNotes.trim()) {
      setError("Don't forget to add session notes!");
      return;
    }
    setError("");
    // Update the unified session data object with experimenter and sessionNotes.
    updateSessionData({
      experimenter,
      sessionNotes,
    });
    console.log("Session Data:", getSessionData());
    router.push("/consent");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 flex flex-col gap-6">
          <div>
            <label className="block mb-1 text-lg font-medium">Experimenter</label>
            <Select value={experimenter} onValueChange={setExperimenter}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Select an experimenter" />
              </SelectTrigger>
              <SelectContent>
                {experimentersList.map((exp) => (
                  <SelectItem key={exp} value={exp}>
                    {exp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-lg font-medium">Session Notes</label>
            <textarea
              placeholder='Record anything unusual about the session that Harrison might want to know about. If nothing unusual occurred, just type "good"'
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full h-40 p-2 border border-gray-300 rounded-md italic placeholder-gray-500"
            />
          </div>
          <div>
            <Button onClick={handleSave}>Record Data and Return to Consent Form</Button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}