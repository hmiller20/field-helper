"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getProgressValue } from "@/utils/sessionProgress"

export default function PrepBaselinePage() {
  const router = useRouter()

  const handleContinue = () => {
    router.push('/drawBaseline')
  }

  return (
    <div className="min-h-screen p-4 bg-background">
      {/* Progress Bar */}
      <div className="mb-6 mx-auto max-w-4xl">
        <Progress value={getProgressValue('prepBaseline')} className="w-full h-2" />
        <p className="text-sm text-gray-600 mt-2 text-center">
          Progress: {getProgressValue('prepBaseline')}%
        </p>
      </div>
      
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-2xl">
        <CardContent className="p-6 flex flex-col items-center gap-8">
          <p className="text-center text-lg sm:text-xl leading-relaxed max-w-xl">
            On the next page, please draw the outline of a man. You don&apos;t have to spend too much time on the drawing.
          </p>
          <Button
            className="w-48 h-16 text-xl bg-[#c1e6c1] hover:bg-[#a8dba8] text-black mt-4"
            variant="secondary"
            onClick={handleContinue}
          >
            Continue
          </Button>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}