"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BlockType, getCurrentSession } from "@/utils/sessionData";
import { capitalize } from "@/utils/capitalize";

// Default prep text
const PREP_TEXT = {
  control: "In the next screen you'll read a short description of a control individual. Imagine what this person looks like and acts like—you'll draw them later.",
  prestige: "In the next screen you'll read a short description of a prestige individual. Imagine what this person looks like and acts like—you'll draw them later.",
  dominance: "In the next screen you'll read a short description of a dominance individual. Imagine what this person looks like and acts like—you'll draw them later."
};

// Second block versions (placeholder text - will be edited later)
const PREP_TEXT_SECOND_BLOCK = {
  control: "In the next screen you'll read a short description of a control individual. Imagine what this person looks like and acts like—you'll draw them later.", // control text doesn't change
  prestige: "Second block prestige prep text - placeholder to be edited later. Imagine what this person looks like and acts like—you'll draw them later.",
  dominance: "Second block dominance prep text - placeholder to be edited later. Imagine what this person looks like and acts like—you'll draw them later."
};

const Prep = ({ blockType }: { blockType: BlockType }) => {
    const router = useRouter();
    const [secondsLeft, setSecondsLeft] = useState(10);

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
      
      // For prestige/dominance blocks, use different text if it's the second block
      if ((blockType === 'prestige' || blockType === 'dominance') && position === 2) {
        return PREP_TEXT_SECOND_BLOCK[blockType];
      }
      
      // Default text for all other cases
      return PREP_TEXT[blockType];
    };

    // simple countdown effect
    useEffect(() => {
        if (secondsLeft === 0) return;
        const id = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
        return () => clearTimeout(id);
    }, [secondsLeft]);

    const handleContinue = () => {
        router.push(`/vignette${capitalize(blockType)}`);
    };

    return (
        <main className="flex flex-col items-center gap-6 p-8">
          <h1 className="text-xl font-semibold">Please read carefully</h1>
          <p className="max-w-lg text-center">
            {getPrepText()}
          </p>
    
          <button
            className="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-40"
            disabled={secondsLeft > 0}
            onClick={handleContinue}
          >
            {secondsLeft > 0 ? `Continue in ${secondsLeft}` : "Continue"}
          </button>
        </main>
      );
    };
    
    export default Prep;