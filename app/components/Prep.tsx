"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BlockType, getCurrentSession, safeColorNamesInText } from "@/utils/sessionData";
import { capitalize } from "@/utils/capitalize";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getConditionProgress, getProgressValue } from "@/utils/sessionProgress";

// Prep text based on position in sessionOrder
const PREP_TEXT = {
  first: "Please read the following description carefully. You will be asked to recall details of the description later.",
  second: "Nice job! Now you will read about another person. Please read the following description carefully. You will be asked to recall details of the description later.",
  third: "Great work! Now you will read about a third person. Please read the following description carefully. You will be asked to recall details of the description later."
};

// Remove the local colorNamesInText function and use the imported one
// helper function to color names in text
// function colorNamesInText(text: string) {
//   return text
//     .replace(/John/g, `<span style=\"color: ${getNameColor("John")}; font-weight: bold;\">John</span>`)
//     .replace(/Bill/g, `<span style=\"color: ${getNameColor("Bill")}; font-weight: bold;\">Bill</span>`);
// }

const Prep = ({ blockType }: { blockType: BlockType }) => {
    const router = useRouter();
    const [canContinue, setCanContinue] = useState(false);

    // Function to get current block's position in sessionOrder (0, 1, or 2)
    const getSessionOrderPosition = (): number => {
      const session = getCurrentSession();
      if (!session || !session.sessionOrder) return 0;
      
      // Find the position of this blockType in the sessionOrder
      const position = session.sessionOrder.indexOf(blockType);
      return position !== -1 ? position : 0;
    };

    // Function to get the appropriate prep text based on sessionOrder position
    const getPrepText = (): string => {
      const position = getSessionOrderPosition();
      
      console.log("=== PREP TEXT DEBUG ===");
      console.log("Block type:", blockType);
      console.log("Position in sessionOrder:", position);
      
      // Map position to text key
      const textKeys = ['first', 'second', 'third'] as const;
      const textKey = textKeys[position] || 'first';
      
      console.log("Using text key:", textKey);
      console.log("Text:", PREP_TEXT[textKey]);
      
      return PREP_TEXT[textKey];
    };

    // Timer effect - shorter duration for prep screen
    useEffect(() => {
        const timer = setTimeout(() => {
            setCanContinue(true);
        }, 3000); // 3 seconds
        return () => clearTimeout(timer);
    }, []);

    const handleContinue = () => {
        router.push(`/vignette${capitalize(blockType)}`);
    };

    return (
        <div className="min-h-screen p-4 bg-background">
            {/* Progress Bar */}
            <div className="mb-6 mx-auto max-w-4xl">
                <Progress
                    value={blockType === 'control' ? getProgressValue('prepControl') : getConditionProgress(blockType, 'prep')}
                    className="w-full h-2"
                />
                <p className="text-sm text-gray-600 mt-2 text-center">
                    Progress: {blockType === 'control' ? getProgressValue('prepControl') : getConditionProgress(blockType, 'prep')}%
                </p>
            </div>
            
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <Card className="w-full max-w-2xl">
                <CardContent className="p-6 flex flex-col items-center gap-8">
                    <div 
                        className="text-left text-lg sm:text-xl leading-relaxed max-w-xl"
                        dangerouslySetInnerHTML={{ __html: safeColorNamesInText(getPrepText()) }}
                    />

                    <Button
                        className={`w-48 h-16 text-xl bg-[#c1e6c1] text-black mt-4 ${
                            canContinue ? "hover:bg-[#a8dba8]" : "cursor-not-allowed pointer-events-none"
                        }`}
                        variant="secondary"
                        style={{ opacity: canContinue ? 1 : 0.5 }}
                        onClick={canContinue ? handleContinue : undefined}
                    >
                        Continue
                    </Button>
                    {!canContinue && (
                        <p className="text-sm text-gray-500 mt-2">
                            The continue button will become available soon. Please read the instructions carefully.
                        </p>
                    )}
                </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Prep;