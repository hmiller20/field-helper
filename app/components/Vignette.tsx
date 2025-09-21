"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BlockType, getCurrentSession, updateSession, safeColorNamesInText, getCharacterForCondition } from "@/utils/sessionData";
import { capitalize } from "@/utils/capitalize";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getConditionProgress, getProgressValue } from "@/utils/sessionProgress";

// Vignette templates with [NAME] placeholder
const VIGNETTE_TEMPLATES: Record<Exclude<BlockType, 'control'>, string> = {
  prestige:
    "A company is hiring a new CEO, and <strong>[NAME]</strong> is being considered for the position. [NAME] has several years of workplace experience and has gained a considerable degree of influence over others. His leadership strategy focuses on <strong>leveraging his skills and abilities</strong> to influence others. In leadership roles, he fosters positive relationships and teamwork among his subordinates. [NAME] <strong>generally takes input from others on how tasks should be accomplished</strong>, although he is also good at making suggestions about how to improve ideas provided by others. When [NAME]'s subordinates have good ideas, they <strong>feel comfortable bringing them up and asking to implement them</strong>, even when those ideas are contrary to [NAME]'s view of the situation. Many subordinates follow [NAME]'s advice because they <strong>respect and admire him</strong>. In sum, [NAME] adopts a leadership style focused on making <strong>skillful decisions</strong>.",
  dominance:
    "A company is hiring a new CEO, and <strong>[NAME]</strong> is being considered for the position. [NAME] has several years of workplace experience and has gained a considerable degree of influence over others. [NAME] has <strong>aggressively moved through the ranks</strong> into a position of leadership. He is a <strong>dominant leader</strong> who prioritizes having control and authority over the people who report to him. When [NAME] makes a decision, that decision is <strong>final</strong>, even when others disagree. [NAME] has his own views of how tasks should be accomplished, and he uses reward and punishment to get people to follow his ideas. Although his subordinates sometimes have good ideas, those subordinates know it is better to let [NAME] have his way rather than contradict his ideas. Many subordinates <strong>fear [NAME]</strong>, and for that reason they follow his orders. In sum, [NAME] adopts a dominant leadership style focused on making <strong>definitive decisions</strong>.",
  lowStatus:
    "A company is hiring a new assistant, and <strong>[NAME]</strong> is being considered for the position. [NAME] does not have much workplace experience and has not had many opportunities to gain influence over others. In previous roles, he has performed his assigned tasks <strong>without drawing attention or taking on additional responsibilities.</strong> [NAME] typically follows instructions well, but he rarely offers suggestions for improvements or takes the initiative to solve problems. His interactions with supervisors and peers are usually formal and reserved, reflecting his <strong>limited role within the organization.</strong> Although [NAME] is dependable when it comes to completing routine duties, he neither seeks nor is offered opportunities to advance or lead. In sum, [NAME] has <strong>limited influence over others.</strong> He seeks jobs in which he can focus on handling simple tasks without having to lead others or shoulder too much responsibility."
};

// Remove the local colorNamesInText function and use the imported one
// helper function to color names in text
// function colorNamesInText(text: string) {
//   return text
//     .replace(/John/g, `<span style=\"color: ${getNameColor("John")}; font-weight: bold;\">John</span>`)
//     .replace(/Bill/g, `<span style=\"color: ${getNameColor("Bill")}; font-weight: bold;\">Bill</span>`);
// }

const Vignette = ({ blockType }: { blockType: BlockType }) => {
  const router = useRouter();
  const [canContinue, setCanContinue] = useState(false);

  // Function to get the appropriate vignette text
  const getVignetteText = (): string => {
    console.log("=== VIGNETTE TEXT DEBUG ===");
    console.log("Block type:", blockType);
    
    // For experimental conditions, get the assigned character and substitute into template
    if (blockType === 'prestige' || blockType === 'dominance' || blockType === 'lowStatus') {
      const characterName = getCharacterForCondition(blockType);
      const template = VIGNETTE_TEMPLATES[blockType];
      const vignetteText = template.replace(/\[NAME\]/g, characterName);
      
      console.log(`Using character: ${characterName} for condition: ${blockType}`);
      console.log("Vignette text:", vignetteText.substring(0, 100) + "...");
      
      return vignetteText;
    }
    
    // For control condition (not implemented yet, but keeping for future use)
    console.log("Control condition not implemented");
    return "Control vignette text placeholder";
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
    <div className="min-h-screen p-4 bg-background">
      {/* Progress Bar */}
      <div className="mb-6 mx-auto max-w-4xl">
        <Progress
          value={blockType === 'control' ? getProgressValue('vignetteControl') : getConditionProgress(blockType, 'vignette')}
          className="w-full h-2"
        />
        <p className="text-sm text-gray-600 mt-2 text-center">
          Progress: {blockType === 'control' ? getProgressValue('vignetteControl') : getConditionProgress(blockType, 'vignette')}%
        </p>
      </div>
      
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-2xl">
        <CardContent className="p-6 flex flex-col items-center gap-8">
          <div 
            className="text-left text-lg sm:text-xl leading-relaxed max-w-xl"
            dangerouslySetInnerHTML={{ __html: safeColorNamesInText(getVignetteText()) }}
          />

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
    </div>
  );
};

export default Vignette;
