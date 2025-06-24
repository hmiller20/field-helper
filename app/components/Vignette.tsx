"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BlockType, getCurrentSession, updateSession } from "@/utils/sessionData";
import { capitalize } from "@/utils/capitalize";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const VIGNETTES: Record<BlockType, string> = {
  control: "John is a 35-year-old man who lives in a mid-sized city. He has brown hair and usually wears business casual clothing to work. John graduated from college with a degree in business administration. He has been working in various professional roles for about ten years since graduation. John typically wakes up early each morning, has coffee and breakfast, then commutes to his office downtown.",
  prestige:
    "A company is hiring a new CEO, and Bill is being considered for the position. Bill has several years of workplace experience and has gained a considerable degree of influence over others. His leadership strategy focuses on leveraging his skills and abilities to influence others. In leadership roles, he fosters positive relationships and teamwork among his subordinates. Bill generally takes input from others on how tasks should be accomplished, although he is also good at making suggestions about how to improve ideas provided by others. When Bill's subordinates have good ideas, they feel comfortable bringing them up and asking to implement them, even when those ideas are contrary to Bill's view of the situation. Many subordinates follow Bill's advice because they respect and admire him. In sum, Bill adopts a leadership style focused on making skillful decisions.",
  dominance:
    "A company is hiring a new CEO, and Bill is being considered for the position. Bill has several years of workplace experience and has gained a considerable degree of influence over others. Bill has aggressively moved through the ranks into a position of leadership. He is a dominant leader who prioritizes having control and authority over the people who report to him. When Bill makes a decision, that decision is final, even when others disagree. Bill has his own views of how tasks should be accomplished, and he uses reward and punishment to get people to follow his ideas. Although his subordinates sometimes have good ideas, those subordinates know it is better to let Bill have his way rather than contradict his ideas. Many subordinates fear Bill, and for that reason they follow his orders. In sum, Bill adopts a dominant leadership style focused on making definitive decisions.",
};

// Second block versions (more information about John)
const VIGNETTES_SECOND_BLOCK: Record<BlockType, string> = {
  control: "John is a 35-year-old man who lives in a mid-sized city. He has brown hair and usually wears business casual clothing to work. John graduated from college with a degree in business administration. He has been working in various professional roles for about ten years since graduation. John typically wakes up early each morning, has coffee and breakfast, then commutes to his office downtown.", // control text doesn't change
  prestige:
    "A company is hiring a new CEO, and John is being considered for the position. John has several years of workplace experience and has gained a considerable degree of influence over others. His leadership strategy focuses on leveraging his skills and abilities to influence others. In leadership roles, he fosters positive relationships and teamwork among his subordinates. John generally takes input from others on how tasks should be accomplished, although he is also good at making suggestions about how to improve ideas provided by others. When John's subordinates have good ideas, they feel comfortable bringing them up and asking to implement them, even when those ideas are contrary to John's view of the situation. Many subordinates follow John's advice because they respect and admire him. In sum, John adopts a leadership style focused on making skillful decisions.",
  dominance:
    "A company is hiring a new CEO, and John is being considered for the position. John has several years of workplace experience and has gained a considerable degree of influence over others. John has aggressively moved through the ranks into a position of leadership. He is a dominant leader who prioritizes having control and authority over the people who report to him. When John makes a decision, that decision is final, even when others disagree. John has his own views of how tasks should be accomplished, and he uses reward and punishment to get people to follow his ideas. Although his subordinates sometimes have good ideas, those subordinates know it is better to let John have his way rather than contradict his ideas. Many subordinates fear John, and for that reason they follow his orders. In sum, John adopts a dominant leadership style focused on making definitive decisions.",
};

const Vignette = ({ blockType }: { blockType: BlockType }) => {
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

  // Function to get the appropriate vignette text
  const getVignetteText = (): string => {
    const position = getCurrentBlockPosition();
    
    console.log("=== VIGNETTE TEXT DEBUG ===");
    console.log("Block type:", blockType);
    console.log("Current position:", position);
    console.log("Will use SECOND_BLOCK?", (blockType === 'prestige' || blockType === 'dominance') && position === 2);
    
    // For prestige/dominance blocks, use different text if it's the second block
    if ((blockType === 'prestige' || blockType === 'dominance') && position === 2) {
      console.log("Using SECOND_BLOCK text (John):", VIGNETTES_SECOND_BLOCK[blockType].substring(0, 100) + "...");
      return VIGNETTES_SECOND_BLOCK[blockType];
    }
    
    // Default text for all other cases
    console.log("Using main VIGNETTES (Bill):", VIGNETTES[blockType].substring(0, 100) + "...");
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
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanContinue(true);
    }, 15000); // 15 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 flex flex-col items-center gap-8">
          <div className="text-left text-lg sm:text-xl leading-relaxed max-w-xl">
            {getVignetteText()}
          </div>

          <Button
            className={`w-48 h-16 text-xl bg-[#c1e6c1] text-black mt-4 ${
              canContinue ? "hover:bg-[#a8dba8]" : "cursor-not-allowed pointer-events-none"
            }`}
            variant="secondary"
            style={{ opacity: canContinue ? 1 : 0.5 }}
            onClick={canContinue ? () => router.push(`/survey${capitalize(blockType)}`) : undefined}
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
  );
};

export default Vignette;
