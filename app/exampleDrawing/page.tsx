"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ExampleDrawingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 flex flex-col items-center gap-8">
          <h1 className="text-2xl font-bold text-center">Example Drawing</h1>
          
          <div className="flex flex-col items-center gap-4">
            <p className="text-center text-lg leading-relaxed">
              In this study, you will draw some figures. Here's an example of what we're looking for in your drawings:
            </p>
            
            {/* Gingerbread man example image */}
            <div className="flex justify-center">
              <img 
                src="/gingerbread.png" 
                alt="Gingerbread man example drawing"
                className="max-w-xs h-auto border rounded-lg shadow-sm"
              />
            </div>
            
            <p className="text-center text-gray-600">
              Take a moment to review this example, then click Continue when you're ready to proceed.
            </p>
          </div>

          <Button
            className="w-48 h-16 text-xl bg-[#c1e6c1] hover:bg-[#a8dba8] text-black"
            variant="secondary"
            onClick={() => router.push('/prepControl')}
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}