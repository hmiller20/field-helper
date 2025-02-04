"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateSessionData } from "@/utils/sessionData"
// Types for our survey questions
type QuestionType = "likert" | "input" | "dropdown";

type Question = {
  id: string;
  text: string;
  category: string;
  questionType: QuestionType;
  options?: string[];
};

const questions: Question[] = [
  // Manipulation check items
  {
    id: "domManip1",
    text: "John is willing to use aggressive tactics to get his way.",
    category: "manipulation",
    questionType: "likert",
  },
  {
    id: "domManip2",
    text: "Others know it is better to let John have his way.",
    category: "manipulation",
    questionType: "likert",
  },
  {
    id: "attnCheck",
    text: "If you are paying attention, select option three.",
    category: "attention",
    questionType: "likert",
  },
  {
    id: "preManip1",
    text: "John's unique talents and abilities are recognized by others.",
    category: "manipulation",
    questionType: "likert",
  },
  {
    id: "preManip2",
    text: "John is considered an expert on some matters by others.",
    category: "manipulation",
    questionType: "likert",
  },
  {
    id: "virtManip1",
    text: "John tends to put others' needs before his own.",
    category: "manipulation",
    questionType: "likert",
  },
  {
    id: "virtManip2",
    text: "Others follow John because of his strong moral character.",
    category: "manipulation",
    questionType: "likert",
  },
  {
    id: "statusManip1",
    text: "John has a lot of influence over others.",
    category: "manipulation",
    questionType: "likert",
  },
  {
    id: "statusManip2",
    text: "John seeks out leadership opportunities regularly.",
    category: "manipulation",
    questionType: "likert",
  },
  {
    id: "participated",
    text: "Have you participated in this study before?",
    category: "participation",
    questionType: "likert",
  },
  {
    id: "gender",
    text: "What is your gender?",
    category: "demographics",
    questionType: "dropdown",
  },
  {
    id: "age",
    text: "What is your age?",
    category: "demographics",
    questionType: "input",
  },
  
  
]

export default function SurveyPage() {
  const [responses, setResponses] = useState<Record<string, string | number>>({})
  const router = useRouter()

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
                {question.questionType === "dropdown" ? (
                  <Select
                    value={responses[question.id]?.toString() || ""}
                    onValueChange={(value: string) => handleResponse(question.id, Number(value))}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.id === "gender" ? (
                        <>
                          <SelectItem value="0">Male</SelectItem>
                          <SelectItem value="1">Female</SelectItem>
                          <SelectItem value="2">Other</SelectItem>
                          <SelectItem value="3">Prefer not to say</SelectItem>
                        </>
                      ) : null}
                    </SelectContent>
                  </Select>
                ) : question.questionType === "input" ? (
                  <input
                    type="text"
                    value={responses[question.id] || ""}
                    onChange={(e) => handleResponse(question.id, e.target.value)}
                    placeholder={question.id === "age" ? "Enter your age" : "Enter your answer"}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <RadioGroup
                    onValueChange={(value) => {
                      if (question.category === "participation") {
                        handleResponse(question.id, Number(value))
                      } else {
                        handleResponse(question.id, parseInt(value))
                      }
                    }}
                    value={responses[question.id]?.toString() || ""}
                    className="flex gap-4"
                  >
                    {question.category === "participation" ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id={`${question.id}-yes`} />
                          <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="0" id={`${question.id}-no`} />
                          <Label htmlFor={`${question.id}-no`}>No</Label>
                        </div>
                      </>
                    ) : (
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
                    )}
                  </RadioGroup>
                )}
              </div>
            ))}
          </div>

          <Button
            className="w-48 h-16 text-xl bg-[#c1e6c1] hover:bg-[#a8dba8] text-black mx-auto"
            variant="secondary"
            disabled={!isComplete}
            onClick={() => {
              updateSessionData({ surveyResponses: responses });
              router.push('/draw');
            }}
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

