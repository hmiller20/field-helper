"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getProgressValue } from "@/utils/sessionProgress"

export default function PrepControlPage() {
  const router = useRouter()

  const handleContinue = () => {
    router.push('/vignetteControl')
  }

  return (
    <div className="min-h-screen p-4 bg-background">
      {/* Progress Bar */}
      <div className="mb-6 mx-auto max-w-4xl">
        <Progress value={getProgressValue('prepControl')} className="w-full h-2" />
        <p className="text-sm text-gray-600 mt-2 text-center">
          Progress: {getProgressValue('prepControl')}%
        </p>
      </div>
      
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-2xl">
        <CardContent className="p-6 flex flex-col items-center gap-8">
          <p className="text-center text-lg sm:text-xl leading-relaxed max-w-xl">
            Please read the following description carefully. Think about what this person might look like in real life.
            Also, think about how they might behave. You will be asked to recall details of the description later.
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

