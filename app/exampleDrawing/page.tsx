"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getProgressValue } from "@/utils/sessionProgress"
import Image from "next/image"

export default function ExampleDrawingPage() {
  const router = useRouter()
  const [canContinue, setCanContinue] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    // Reset navigation state on mount
    setIsNavigating(false)
    setCanContinue(false)

    const timer = setTimeout(() => {
      setCanContinue(true);
    }, 10000); // 10 seconds
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = async () => {
    if (isNavigating || !canContinue) return;

    setIsNavigating(true);

    try {
      await router.push('/prepBaseline');
    } catch (error) {
      console.error('Navigation failed:', error);
      // Re-enable button on navigation failure
      setIsNavigating(false);
    }
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 bg-white">
      {/* Progress Bar */}
      <div className="mb-6 mx-auto max-w-4xl px-4">
        <Progress value={getProgressValue('exampleDrawing')} className="w-full h-2" />
        <p className="text-sm text-gray-600 mt-2 text-center">
          Progress: {getProgressValue('exampleDrawing')}%
        </p>
      </div>
      
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
        <CardContent className="p-3 sm:p-4 md:p-6 flex flex-col items-center gap-4 sm:gap-6 md:gap-8">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-center">Example Drawing</h1>
          
          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
            <p className="text-center text-sm sm:text-base md:text-lg leading-relaxed px-2">
              In this study, you will draw some figures. Here&apos;s an example of what we&apos;re looking for in your drawings:
            </p>
            
            {/* Gingerbread man example image */}
            <div className="flex justify-center w-full">
              <div className="relative w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px] aspect-square">
                <Image 
                  src="/gingerbread.png" 
                  alt="Gingerbread man example drawing"
                  className="border rounded-lg shadow-sm object-contain"
                  fill
                  sizes="(max-width: 640px) 200px, (max-width: 768px) 250px, 300px"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 sm:gap-3 w-full">
            <Button
              className={`w-full max-w-[200px] sm:max-w-[240px] h-12 sm:h-14 md:h-16 text-base sm:text-lg md:text-xl bg-[#c1e6c1] text-black ${
                canContinue && !isNavigating ? "hover:bg-[#a8dba8]" : "cursor-not-allowed"
              }`}
              variant="secondary"
              style={{ opacity: canContinue && !isNavigating ? 1 : 0.5 }}
              onClick={handleContinue}
              disabled={!canContinue || isNavigating}
            >
              {isNavigating ? "Loading..." : "Continue"}
            </Button>
            {!canContinue && !isNavigating && (
              <p className="text-xs sm:text-sm text-gray-500 text-center px-2">
                The continue button will become available soon. Please review the example carefully.
              </p>
            )}
            {isNavigating && (
              <p className="text-xs sm:text-sm text-gray-500 text-center px-2">
                Navigating to next page...
              </p>
            )}
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}