"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { updateSession, getCurrentSession } from "@/utils/sessionData"

// Types for our survey questions
type QuestionType = "likert";

type Question = {
  id: string;
  text: string;
  category: string;
  questionType: QuestionType;
  options?: string[];
};

const baseQuestions: Question[] = [
  // Manipulation check items
  {
    id: "domManip1_d",
    text: "[NAME] is willing to use aggressive tactics to get his way.",
    category: "manipulation",
    questionType: "likert",
  },
  {
    id: "domManip2_d",
    text: "Others know it is better to let [NAME] have his way.",
    category: "manipulation",
    questionType: "likert",
  },
  {
    id: "attnCheck_d",
    text: "If you are paying attention, select option three.",
    category: "attention",
    questionType: "likert",
  },
  {
    id: "preManip1_d",
    text: "[NAME]'s unique talents and abilities are recognized by others.",
    category: "manipulation",
    questionType: "likert",
  },
  {
    id: "preManip2_d",
    text: "[NAME] is considered an expert on some matters by others.",
    category: "manipulation",
    questionType: "likert",
  },
  {
    id: "virtManip1_d",
    text: "When [NAME] makes decisions, he pursues the most ethical course of action.",
    category: "manipulation",
    questionType: "likert",
  },
  {
    id: "virtManip2_d",
    text: "Others follow [NAME] because of his strong moral character.",
    category: "manipulation",
    questionType: "likert",
  },
  {
    id: "statusManip1_d",
    text: "[NAME] has a lot of influence over others.",
    category: "manipulation",
    questionType: "likert",
  },
  {
    id: "statusManip2_d",
    text: "[NAME] seeks out leadership opportunities regularly.",
    category: "manipulation",
    questionType: "likert",
  },
]

export default function SurveyDominancePage() {
  const [responses, setResponses] = useState<Record<string, string | number>>({})
  const router = useRouter()

  // Function to determine person's name based on block position
  const getPersonName = (): string => {
    const session = getCurrentSession();
    if (!session) return "John"; // default
    
    const completedBlocksCount = session.blocks?.length || 0;
    const currentBlockPosition = completedBlocksCount + 1;
    
    // Control is block 1 (John), second block is John, third block is Bill
    return currentBlockPosition === 3 ? "Bill" : "John";
  };

  // Create questions with the appropriate name substituted
  const questions = baseQuestions.map(question => ({
    ...question,
    text: question.text.replace(/\[NAME\]/g, getPersonName())
  }));

  const isComplete = questions.every((q) => responses[q.id] !== undefined && responses[q.id] !== "")

  const handleResponse = (questionId: string, value: string | number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6 flex flex-col gap-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Please rate how much you agree with each statement.</h2>
            
            {questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <Label className="text-lg">{question.text}</Label>
                <RadioGroup
                  onValueChange={(value) => handleResponse(question.id, parseInt(value))}
                  value={responses[question.id]?.toString() || ""}
                  className="flex gap-4"
                >
                  <div className="w-full">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Strongly disagree</span>
                      <span className="text-sm">Strongly agree</span>
                    </div>
                    <div className="flex justify-between">
                      {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                        <div key={value} className="flex flex-col items-center gap-1">
                          <Label htmlFor={`${question.id}-${value}`} className="text-sm">
                            {value}
                          </Label>
                          <RadioGroupItem value={value.toString()} id={`${question.id}-${value}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>

          <Button
            className="w-48 h-16 text-xl bg-[#c1e6c1] hover:bg-[#a8dba8] text-black mx-auto"
            variant="secondary"
            disabled={!isComplete}
            onClick={() => {
              updateSession({ 
                tempSurvey: responses 
              });
              router.push('/drawDominance');
            }}
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}