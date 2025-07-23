"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { safeColorNamesInText } from "@/utils/sessionData"


const Vignettes = [
  {
    name: "control",
    text: "John is a 35-year-old man who lives in a mid-sized city. He has brown hair. He has been working in various professional roles for about ten years since graduation. John typically wakes up early each morning, has coffee and breakfast, then commutes to his office downtown.",
  }
]

// Remove the local colorNamesInText function and use the imported one
// helper function to color names in text
// function colorNamesInText(text: string) {
//   // Replace <strong>John</strong> first, then plain John
//   const johnColor = getNameColor("John");
//   const billColor = getNameColor("Bill");
//   return text
//     .replace(/<strong>John<\/strong>/g, `<strong><span style="color: ${johnColor};">John</span></strong>`)
//     .replace(/John/g, `<span style="color: ${johnColor}; font-weight: bold;">John</span>`)
//     .replace(/<strong>Bill<\/strong>/g, `<strong><span style="color: ${billColor};">Bill</span></strong>`)
//     .replace(/Bill/g, `<span style="color: ${billColor}; font-weight: bold;">Bill</span>`);
// }

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

  // Condition information is now tracked through presentedFirst field and blocks array

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 flex flex-col items-center gap-8">
          <div
            className="text-left text-lg sm:text-xl leading-relaxed max-w-xl"
            dangerouslySetInnerHTML={{ __html: safeColorNamesInText(vignette.text) }}
          />

          <Button
            className={`w-48 h-16 text-xl bg-[#c1e6c1] text-black mt-4 ${
              canContinue ? "hover:bg-[#a8dba8]" : "cursor-not-allowed pointer-events-none"
            }`}
            variant="secondary"
            style={{ opacity: canContinue ? 1 : 0.5 }}
            onClick={canContinue ? () => router.push('/surveyControl') : undefined}
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

