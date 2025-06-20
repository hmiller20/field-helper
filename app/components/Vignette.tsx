"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BlockType, getCurrentSession, updateSession } from "@/utils/sessionData";
import { capitalize } from "@/utils/capitalize";

const VIGNETTES: Record<BlockType, string> = {
  control: "John is an average person you might pass on the street …",
  prestige:
    "John is widely respected for his expertise and often mentors others …",
  dominance:
    "John commands attention by asserting himself forcefully in meetings …",
};

// Second block versions (placeholder text - will be edited later)
const VIGNETTES_SECOND_BLOCK: Record<BlockType, string> = {
  control: "John is an average person you might pass on the street …", // control text doesn't change
  prestige:
    "John is a second block prestige person - placeholder text to be edited later …",
  dominance:
    "John is a second block dominance person - placeholder text to be edited later …",
};

const Vignette = ({ blockType }: { blockType: BlockType }) => {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(15);

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

  // Function to get the appropriate vignette text
  const getVignetteText = (): string => {
    const position = getCurrentBlockPosition();
    
    // For prestige/dominance blocks, use different text if it's the second block
    if ((blockType === 'prestige' || blockType === 'dominance') && position === 2) {
      return VIGNETTES_SECOND_BLOCK[blockType];
    }
    
    // Default text for all other cases
    return VIGNETTES[blockType];
  };

  // save start time in session temp field
  useEffect(() => {
    console.log("=== VIGNETTE: Component loaded ===");
    
    const session = getCurrentSession();
    console.log("=== VIGNETTE: getCurrentSession result ===", session);
    console.log("=== VIGNETTE: Session ID ===", session?.id);
    
    if (!session) {
      console.log("=== VIGNETTE: No session found, redirecting to consent ===");
      router.push('/consent');
      return;
    }
    
    console.log("=== VIGNETTE: Updating session with vignette start time ===");
    updateSession({ tempVignetteStart: Date.now() });
    
    // Verify the update worked
    const updatedSession = getCurrentSession();
    console.log("=== VIGNETTE: Session after update ===", updatedSession);
    console.log("=== VIGNETTE: Session ID after update ===", updatedSession?.id);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  return (
    <main className="flex flex-col items-center gap-6 p-8">
      <article className="max-w-2xl">{getVignetteText()}</article>

      <button
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-40"
        disabled={secondsLeft > 0}
        onClick={() => router.push(`/survey${capitalize(blockType)}`)}
      >
        {secondsLeft > 0 ? `Continue in ${secondsLeft}` : "Continue"}
      </button>
    </main>
  );
};

export default Vignette;
