"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getProgressValue } from "@/utils/sessionProgress"
import { getCurrentSession, getNextBlockType } from "@/utils/sessionData"
import { capitalize } from "@/utils/capitalize"

export default function InformationPage() {
  const router = useRouter()
  const [canContinue, setCanContinue] = useState(false)

  useEffect(() => {
    // Verify session has baseline drawing completed
    const session = getCurrentSession();
    if (!session || !session.baselineDrawing) {
      console.error("No baseline drawing found, redirecting to baseline");
      router.push('/prepBaseline');
      return;
    }
    
    if (!session.sessionOrder || session.sessionOrder.length === 0) {
      console.error("No session order found, redirecting to baseline");
      router.push('/prepBaseline');
      return;
    }
  }, [router]);

  // Timer effect - 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanContinue(true);
    }, 10000); // 10 seconds
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (!canContinue) return;
    const nextBlockType = getNextBlockType();
    if (nextBlockType) {
      router.push(`/prep${capitalize(nextBlockType)}`);
    } else {
      console.error("No next block type found");
      router.push('/demographics');
    }
  }

  return (
    <div className="min-h-screen p-4 bg-background">
      {/* Progress Bar */}
      <div className="mb-6 mx-auto max-w-4xl">
        <Progress value={getProgressValue('information')} className="w-full h-2" />
        <p className="text-sm text-gray-600 mt-2 text-center">
          Progress: {getProgressValue('information')}%
        </p>
      </div>
      
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-2xl">
        <CardContent className="p-6 flex flex-col items-center gap-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Great job on your first drawing!</h2>
            <p className="text-lg sm:text-xl leading-relaxed max-w-xl">
              Now you will be presented with three different descriptions of people. For each description, 
              you will read about the person, answer some questions, and then draw that person.
            </p>
            <p className="text-lg sm:text-xl leading-relaxed max-w-xl">
            <strong>Remember, don&apos;t just draw the same person three times. You will read about three different people!</strong>
            </p>
          </div>

          <Button
            className={`w-48 h-16 text-xl mt-4 ${
              canContinue 
                ? "bg-[#c1e6c1] hover:bg-[#a8dba8] text-black" 
                : "bg-gray-400 cursor-not-allowed text-white"
            }`}
            style={{ opacity: canContinue ? 1 : 0.5 }}
            variant="secondary"
            onClick={canContinue ? handleContinue : undefined}
            disabled={!canContinue}
          >
            Continue
          </Button>
          {!canContinue && (
            <p className="text-sm text-gray-500 mt-2">
              Please read the instructions carefully. The button will become available soon.
            </p>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  )
}