"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function ExampleDrawingPage() {
  const router = useRouter()
  const [canContinue, setCanContinue] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanContinue(true);
    }, 10000); // 10 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 flex flex-col items-center gap-8">
          <h1 className="text-2xl font-bold text-center">Example Drawing</h1>
          
          <div className="flex flex-col items-center gap-4">
            <p className="text-center text-lg leading-relaxed">
              In this study, you will draw some figures. Here&apos;s an example of what we&apos;re looking for in your drawings:
            </p>
            
            {/* Gingerbread man example image */}
            <div className="flex justify-center">
              <Image 
                src="/gingerbread.png" 
                alt="Gingerbread man example drawing"
                className="max-w-xs h-auto border rounded-lg shadow-sm"
                width={300}
                height={300}
              />
            </div>
          </div>

          <Button
            className={`w-48 h-16 text-xl bg-[#c1e6c1] text-black mt-4 ${
              canContinue ? "hover:bg-[#a8dba8]" : "cursor-not-allowed pointer-events-none"
            }`}
            variant="secondary"
            style={{ opacity: canContinue ? 1 : 0.5 }}
            onClick={canContinue ? () => router.push('/prepControl') : undefined}
          >
            Continue
          </Button>
          {!canContinue && (
            <p className="text-sm text-gray-500 mt-2">
              The continue button will become available soon. Please review the example carefully.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}