"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { 
  getCurrentResearcher, 
  signInResearcher, 
  signOutResearcher, 
  exportResearcherData,
  getSessionCount
} from "@/utils/sessionData"
import { formatESTDateTime, formatESTTime } from "@/utils/timezone"

// List of researchers - you can modify this list as needed
const RESEARCHERS = [
  "Alice Johnson",
  "Bob Smith", 
  "Carol Davis",
  "David Wilson",
  "Emma Brown"
]

const CORRECT_PASSWORD = "5678"

export default function ResearcherSignIn() {
  const [currentResearcher, setCurrentResearcher] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false)
  const [selectedResearcher, setSelectedResearcher] = useState("")
  const [password, setPassword] = useState("")
  const [signOutPassword, setSignOutPassword] = useState("")
  const [error, setError] = useState("")
  const [signOutError, setSignOutError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Check for existing researcher session on mount
  useEffect(() => {
    const researcher = getCurrentResearcher()
    setCurrentResearcher(researcher)
  }, [])

  const handleSignIn = () => {
    setError("")
    
    if (!selectedResearcher) {
      setError("Please select a researcher")
      return
    }
    
    if (!password) {
      setError("Please enter the password")
      return
    }
    
    if (password !== CORRECT_PASSWORD) {
      setError("Incorrect password")
      return
    }
    
    setIsLoading(true)
    
    try {
      const sessionId = signInResearcher(selectedResearcher)
      const newResearcher = getCurrentResearcher()
      setCurrentResearcher(newResearcher)
      setIsDialogOpen(false)
      setSelectedResearcher("")
      setPassword("")
      setError("")
    } catch (error) {
      setError("Failed to sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOutClick = () => {
    setSignOutError("")
    setSignOutPassword("")
    setIsSignOutDialogOpen(true)
  }

  const handleSignOutConfirm = async () => {
    setSignOutError("")
    
    if (!signOutPassword) {
      setSignOutError("Please enter the password")
      return
    }
    
    if (signOutPassword !== CORRECT_PASSWORD) {
      setSignOutError("Incorrect password")
      return
    }
    
    setIsLoading(true)
    
    try {
      await signOutResearcher()
      setCurrentResearcher(null)
      setIsSignOutDialogOpen(false)
      setSignOutPassword("")
    } catch (error) {
      console.error("Failed to sign out:", error)
      setSignOutError("Failed to sign out. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOutCancel = () => {
    setIsSignOutDialogOpen(false)
    setSignOutPassword("")
    setSignOutError("")
  }

  const handleViewRemoteData = async () => {
    try {
      const response = await fetch('/api/researcher');
      if (response.ok) {
        const result = await response.json();
        const sessions = result.data;
        
                 // Calculate totals
         const totalHours = sessions.reduce((sum: number, session: any) => 
           sum + (session.duration_hours || 0), 0);
         const totalSessionsCompleted = sessions.reduce((sum: number, session: any) => 
           sum + (session.sessions_completed || 0), 0);
        
                 // Create summary by researcher
         const summary = sessions.reduce((acc: any, session: any) => {
           if (!acc[session.researcher_name]) {
             acc[session.researcher_name] = { shifts: 0, hours: 0, totalSessions: 0 };
           }
           acc[session.researcher_name].shifts++;
           acc[session.researcher_name].hours += session.duration_hours || 0;
           acc[session.researcher_name].totalSessions += session.sessions_completed || 0;
           return acc;
         }, {});
         
         const summaryText = Object.entries(summary)
           .map(([name, data]: [string, any]) => 
             `${name}: ${data.shifts} shifts, ${data.hours.toFixed(1)} hours, ${data.totalSessions} sessions completed`)
           .join('\n');
        
                 alert(
           `Remote Researcher Data Summary:\n\n` +
           `Total Shifts: ${sessions.length}\n` +
           `Total Hours: ${totalHours.toFixed(1)}\n` +
           `Total Sessions Completed: ${totalSessionsCompleted}\n\n` +
           `By Researcher:\n${summaryText}\n\n` +
           `Check browser console for detailed data.`
         );
        
        console.log('Full researcher sessions data:', sessions);
      } else {
        alert('Failed to fetch remote data. Check your internet connection.');
      }
    } catch (error) {
      console.error("Failed to fetch remote data:", error);
      alert("Failed to fetch remote data. Please try again.");
    }
  }

  const handleExportData = async () => {
    try {
      // Export from Supabase instead of localStorage
      const response = await fetch('/api/researcher');
      if (response.ok) {
        const result = await response.json();
        const data = result.data;
        
                 // Convert to CSV-like format for easy Excel import with EST times
         const csvData = data.map((session: any) => ({
           researcherName: session.researcher_name,
           date: session.date,
           signInTime: formatESTDateTime(new Date(session.sign_in_time).getTime()) + ' EST',
           signOutTime: session.sign_out_time ? formatESTDateTime(new Date(session.sign_out_time).getTime()) + ' EST' : "Still signed in",
           durationHours: session.duration_hours || 0,
           sessionsCompleted: session.sessions_completed || 0,
           sessionId: session.id
         }));
        
        const jsonData = JSON.stringify(csvData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `researcher-hours-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Fallback to local data if Supabase fails
        const rawData = exportResearcherData();
        const blob = new Blob([rawData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `researcher-hours-local-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to export data:", error);
      alert("Failed to export data. Please try again.");
    }
  }

  // If researcher is signed in, show sign-out button
  if (currentResearcher) {
    const signInTime = formatESTTime(currentResearcher.signInTime)
    const duration = Date.now() - currentResearcher.signInTime
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    const sessionsCompleted = getSessionCount()

    return (
      <>
        <Button
          onClick={handleSignOutClick}
          variant="outline"
          className="text-sm bg-green-50 text-green-800 border border-green-300 hover:bg-green-100 shadow-sm transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Signing out..." : `Sign Out`}
        </Button>

        {/* Sign-out confirmation dialog */}
        <Dialog open={isSignOutDialogOpen} onOpenChange={setIsSignOutDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Sign-Out</DialogTitle>
            </DialogHeader>
            <Card className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Enter the password to confirm sign-out for <strong>{currentResearcher.researcherName}</strong>
              </p>

              <div className="space-y-2">
                <Label htmlFor="signout-password">Password</Label>
                <Input
                  id="signout-password"
                  type="password"
                  value={signOutPassword}
                  onChange={(e) => setSignOutPassword(e.target.value)}
                  placeholder="Enter password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSignOutConfirm()
                    }
                  }}
                />
              </div>

              {signOutError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {signOutError}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSignOutConfirm}
                  disabled={isLoading}
                  className="flex-1"
                  variant="destructive"
                >
                  {isLoading ? "Signing out..." : "Confirm Sign Out"}
                </Button>
                <Button
                  onClick={handleSignOutCancel}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // If no researcher signed in, show sign-in button
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-sm bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100 shadow-sm transition-colors"
        >
          Researcher Sign-In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Researcher Sign-In</DialogTitle>
        </DialogHeader>
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="researcher">Select Researcher</Label>
            <Select value={selectedResearcher} onValueChange={setSelectedResearcher}>
              <SelectTrigger id="researcher">
                <SelectValue placeholder="Choose researcher..." />
              </SelectTrigger>
              <SelectContent>
                {RESEARCHERS.map((researcher) => (
                  <SelectItem key={researcher} value={researcher}>
                    {researcher}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSignIn()
                }
              }}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  )
} 