"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { updateSessionData, getSessionData, incrementSessionCount } from "@/utils/sessionData";

export default function ExperimenterPage() {
  const [experimenter, setExperimenter] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionGood, setSessionGood] = useState(false);
  const [sessionTest, setSessionTest] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const experimentersList = ["Amelia", "Brady", "Edward", "Eva", "Harrison", "Megan", "Nate", "Rafa", "Ramsey", "Sean", "Sofia", "Sophia"];

  // Handle checkbox changes with mutual exclusivity
  const handleSessionGoodChange = (checked: boolean) => {
    setSessionGood(checked);
    if (checked) {
      setSessionTest(false); // Uncheck test if good is checked
    }
  };

  const handleSessionTestChange = (checked: boolean) => {
    setSessionTest(checked);
    if (checked) {
      setSessionGood(false); // Uncheck good if test is checked
    }
  };

  // Handle button click: validate and record data to local storage and navigate to consent screen.
  const handleSave = () => {
    if (!experimenter) {
      setError("Please select an experimenter");
      return;
    }
    
    // Only require session notes if neither checkbox is selected
    if (!sessionGood && !sessionTest && !sessionNotes.trim()) {
      setError("Please enter session notes or check 'All good' or 'Test session'");
      return;
    }
    
    setError("");
    
    console.log("=== EXPERIMENTER PAGE: Saving data ===");
    console.log("Experimenter:", experimenter);
    console.log("Session Notes:", sessionNotes);
    console.log("Session Good:", sessionGood);
    console.log("Session Test:", sessionTest);
    
    // Update the unified session data object with experimenter data and flags
    updateSessionData({
      experimenter,
      sessionNotes,
      sessionGood,
      sessionTest,
    });
    
    // Only increment session count if it's not a test session
    if (!sessionTest) {
      const newCount = incrementSessionCount();
      console.log("=== EXPERIMENTER PAGE: Session count incremented to:", newCount);
    } else {
      console.log("=== EXPERIMENTER PAGE: Test session - session count NOT incremented");
    }
    
    // Verify the data was saved
    const sessionData = getSessionData();
    console.log("=== EXPERIMENTER PAGE: Session data after save ===");
    console.log("Total sessions:", sessionData.length);
    if (sessionData.length > 0) {
      const mostRecent = sessionData[sessionData.length - 1];
      console.log("Most recent session experimenter:", mostRecent.experimenter);
      console.log("Most recent session notes:", mostRecent.sessionNotes);
      console.log("Most recent session good:", mostRecent.sessionGood);
      console.log("Most recent session test:", mostRecent.sessionTest);
    }
    
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
          
          {/* Large checkboxes */}
          <div className="flex flex-col gap-4">
            <label className="block mb-2 text-lg font-medium">Session Status</label>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sessionGood}
                  onChange={(e) => handleSessionGoodChange(e.target.checked)}
                  className="w-6 h-6 mr-3"
                />
                <span className="text-lg font-medium text-green-700">All good - no issues</span>
              </label>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sessionTest}
                  onChange={(e) => handleSessionTestChange(e.target.checked)}
                  className="w-6 h-6 mr-3"
                />
                <span className="text-lg font-medium text-blue-700">Test session</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-lg font-medium">
              Session Notes 
              {(sessionGood || sessionTest) && <span className="text-gray-500 text-sm">(Optional)</span>}
            </label>
            <textarea
              placeholder={
                sessionGood ? 'Session went smoothly. Add any additional notes here if needed.' :
                sessionTest ? 'This is a test session. Add any testing notes here if needed.' :
                'If anything unusual or noteworthy occurred, please record it here. If everything went smoothly, just check the "All good" box. If this is a test session, check the "Test" box instead.'
              }
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md italic placeholder-gray-500"
            />
          </div>
          
          <div>
            <Button onClick={handleSave} className="w-full">
              Record Data and Return to Consent Form
            </Button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}