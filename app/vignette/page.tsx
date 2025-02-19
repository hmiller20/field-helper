"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { updateSessionData } from "@/utils/sessionData";

const Vignettes = [
  {
    name: "dominance",
    text: "A company is hiring a new CEO, and John is being considered for the position. John has several years of workplace experience and has gained a considerable degree of influence over others. John has aggressively moved through the ranks into a position of leadership. He is a dominant leader who prioritizes having control and authority over the people who report to him. When John makes a decision, that decision is final, even when others disagree. John has his own views of how tasks should be accomplished, and he uses reward and punishment to get people to follow his ideas. Although his subordinates sometimes have good ideas, those subordinates know it is better to let John have his way rather than contradict his ideas. Many subordinates fear John, and for that reason they follow his orders. In sum, John adopts a dominant leadership style focused on making definitive decisions.",
  },
  {
    name: "prestige",
    text: "A company is hiring a new CEO, and John is being considered for the position. John has several years of workplace experience and has gained a considerable degree of influence over others. His leadership strategy focuses on leveraging his skills and abilities to influence others. In leadership roles, he fosters positive relationships and teamwork among his subordinates. John generally takes input from others on how tasks should be accomplished, although he is also good at making suggestions about how to improve ideas provided by others. When John's subordinates have good ideas, they feel comfortable bringing them up and asking to implement them, even when those ideas are contrary to John's view of the situation. Many subordinates follow John's advice because they respect and admire him. In sum, John adopts a leadership style focused on making skillful decisions.",
  },
  {
    name: "virtue",
    text: "A company is hiring a new CEO, and John is being considered for the position. John has several years of workplace experience and has gained a considerable degree of influence over others. John's leadership approach focuses on putting the wellbeing of others ahead of personal gain. In leadership roles, he consistently demonstrates a willingness to sacrifice his own interests to do what is right. John leads by exemplifying strong moral principles. When faced with ethical dilemmas, he prioritizes doing what is right over what is expedient or profitable in the short term. When difficult decisions need to be made, John carefully considers the impact on all stakeholders, especially the most vulnerable. Many subordinates follow John not simply out of respect for his abilities, but because they are inspired by his moral character and feel that he will do what is right. In sum, John adopts a leadership style focused on making ethical decisions that benefit others, even at personal cost.",
  },
  { name: "lowStatus",
    text: "A company is hiring a new janitor, and John is being considered for the position. John does not have much workplace experience and has not had many opportunities to gain influence over others. In previous roles, he has performed his assigned cleaning tasks without drawing attention or taking on additional responsibilities. John typically follows instructions well, but he rarely offers suggestions for improvements or takes the initiative to solve problems. His interactions with supervisors and peers are usually formal and reserved, reflecting his limited role within the organization. Although John is dependable when it comes to completing routine duties, he neither seeks nor is offered opportunities to advance or lead. In sum, John has limited influence over others. He seeks jobs in which he can focus on handling simple tasks without having to lead others or shoulder too much responsibility.",
  },
]

export default function VignettePage() {
  const router = useRouter()
  const [vignette, setVignette] = useState<typeof Vignettes[number] | null>(null)
  const [visibleWordCount, setVisibleWordCount] = useState(0)
  const wordDelay = 225

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * Vignettes.length)
    const selected = Vignettes[randomIndex]
    setVignette(selected)
  }, [])

  useEffect(() => {
    if (!vignette) return
    setVisibleWordCount(0)
    const wordsArray = vignette.text.split(" ")
    let count = 0
    const interval = setInterval(() => {
      count++
      setVisibleWordCount(count)
      if (count >= wordsArray.length) {
        clearInterval(interval)
      }
    }, wordDelay)
    return () => clearInterval(interval)
  }, [vignette, wordDelay])

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

  const words = vignette.text.split(" ");
  const isVignetteComplete = visibleWordCount >= words.length;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 flex flex-col items-center gap-8">
          <div className="text-left text-lg sm:text-xl leading-relaxed max-w-xl">
            {words.map((word, index) => (
              <span
                key={index}
                style={{
                  opacity: index < visibleWordCount ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out'
                }}
              >
                {word}{index !== words.length - 1 ? " " : ""}
              </span>
            ))}
          </div>

          <Button
            className={`w-48 h-16 text-xl bg-[#c1e6c1] text-black mt-4 ${
              isVignetteComplete ? "hover:bg-[#a8dba8]" : "cursor-not-allowed pointer-events-none"
            }`}
            variant="secondary"
            style={{ opacity: isVignetteComplete ? 1 : 0.5 }}
            onClick={isVignetteComplete ? () => router.push('/survey') : undefined}
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

