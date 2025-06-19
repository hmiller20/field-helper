"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { updateSessionData } from "@/utils/sessionData";

const Vignettes = [
  {
    name: "control",
    text: "A guy who is pretty normal.",
  }
]

export default function VignettePage() {
  const router = useRouter()
  const [vignette, setVignette] = useState<typeof Vignettes[number] | null>(null)
  const [canContinue, setCanContinue] = useState(false)

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * Vignettes.length)
    const selected = Vignettes[randomIndex]
    setVignette(selected)
  }, [])

  useEffect(() => {
    if (!vignette) return;
    const timer = setTimeout(() => {
      setCanContinue(true);
    }, 15000); // 15 seconds
    return () => clearTimeout(timer);
  }, [vignette])

  if (!vignette) return <div>Loading...</div>

  const conditionMapping: Record<string, number> = {
    dominance: 1,
    prestige: 2,
    virtue: 3,
    lowStatus: 4,
  };

  updateSessionData({
    vignette: vignette.name,
    conditionValue: conditionMapping[vignette.name],
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 flex flex-col items-center gap-8">
          <div className="text-left text-lg sm:text-xl leading-relaxed max-w-xl">
            {vignette.text}
          </div>

          <Button
            className={`w-48 h-16 text-xl bg-[#c1e6c1] text-black mt-4 ${
              canContinue ? "hover:bg-[#a8dba8]" : "cursor-not-allowed pointer-events-none"
            }`}
            variant="secondary"
            style={{ opacity: canContinue ? 1 : 0.5 }}
            onClick={canContinue ? () => router.push('/survey') : undefined}
          >
            Continue
          </Button>
          {!canContinue && (
            <p className="text-sm text-gray-500 mt-2">
              The continue button will become available soon. Please read the description carefully.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

