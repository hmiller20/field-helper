"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BlockType, getCurrentSession, getNameColor } from "@/utils/sessionData";
import { capitalize } from "@/utils/capitalize";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Default prep text
const PREP_TEXT = {
  control: "Please read the following description carefully. Think about what this person might look like in real life. Also, think about how they might behave. You will be asked to recall details of the description later.",
  prestige: "Now you will read about <strong>Bill,</strong> another person being considered for a similar position at a different company in town. Please read the following description carefully. Think about what this person might look like in real life. Also, think about how they might behave. You will be asked to recall details of the description later.",
  dominance: "Now you will read about <strong>Bill,</strong> another person being considered for a similar position at a different company in town. Please read the following description carefully. Think about what this person might look like in real life. Also, think about how they might behave. You will be asked to recall details of the description later."
};

// Second block versions (when it's the first prestige/dominance block about John)
const PREP_TEXT_SECOND_BLOCK = {
  control: "Please read the following description carefully. Think about what this person might look like in real life. Also, think about how they might behave. You will be asked to recall details of the description later.", // control text doesn't change
  prestige: "We are now going to <strong>share more information about John.</strong> Please read the following description carefully.",
  dominance: "We are now going to <strong>share more information about John.</strong> Please read the following description carefully."
};

// helper function to color names in text
function colorNamesInText(text: string) {
  return text
    .replace(/John/g, `<span style=\"color: ${getNameColor("John")}; font-weight: bold;\">John</span>`)
    .replace(/Bill/g, `<span style=\"color: ${getNameColor("Bill")}; font-weight: bold;\">Bill</span>`);
}

const Prep = ({ blockType }: { blockType: BlockType }) => {
    const router = useRouter();
    const [canContinue, setCanContinue] = useState(false);

    // Function to determine if current block is second or third
    const getCurrentBlockPosition = (): number => {
      const session = getCurrentSession();
      if (!session) return 1;
      
      // Control is always first (position 1)
      if (blockType === 'control') return 1;
      
      // For prestige/dominance, check completed blocks
      const completedBlocksCount = session.blocks?.length || 0;
      return completedBlocksCount + 1; // +1 because we're about to start this block
    };

    // Function to get the appropriate prep text
    const getPrepText = (): string => {
      const position = getCurrentBlockPosition();
      
      console.log("=== PREP TEXT DEBUG ===");
      console.log("Block type:", blockType);
      console.log("Current position:", position);
      console.log("Will use SECOND_BLOCK?", (blockType === 'prestige' || blockType === 'dominance') && position === 2);
      
      // For prestige/dominance blocks, use different text if it's the second block
      if ((blockType === 'prestige' || blockType === 'dominance') && position === 2) {
        console.log("Using SECOND_BLOCK text (John):", PREP_TEXT_SECOND_BLOCK[blockType]);
        return PREP_TEXT_SECOND_BLOCK[blockType];
      }
      
      // Default text for all other cases
      console.log("Using main PREP_TEXT (Bill):", PREP_TEXT[blockType]);
      return PREP_TEXT[blockType];
    };

    // Timer effect - shorter duration for prep screen
    useEffect(() => {
        const timer = setTimeout(() => {
            setCanContinue(true);
        }, 10000); // 10 seconds
        return () => clearTimeout(timer);
    }, []);

    const handleContinue = () => {
        router.push(`/vignette${capitalize(blockType)}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-2xl">
                <CardContent className="p-6 flex flex-col items-center gap-8">
                    <div 
                        className="text-left text-lg sm:text-xl leading-relaxed max-w-xl"
                        dangerouslySetInnerHTML={{ __html: colorNamesInText(getPrepText()) }}
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
    );
};

export default Prep;