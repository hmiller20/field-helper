"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BlockType, getCurrentSession, updateSession } from "@/utils/sessionData";
import { capitalize } from "@/utils/capitalize";

interface Q {
  id: string;
  prompt: string;
}

//  expand the ITEMS array and replace radio inputs with the Likert component later.
const ITEMS: Record<BlockType, Q[]> = {
  control: [{ id: "mc_dom", prompt: "How dominant is John?" }],
  prestige: [{ id: "mc_pres", prompt: "How prestigious is John?" }],
  dominance: [{ id: "mc_dom", prompt: "How dominant is John?" }],
};

const Survey = ({ blockType }: { blockType: BlockType }) => {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleRadio = (id: string, value: string) =>
    setAnswers((a) => ({ ...a, [id]: value }));

  const allDone = ITEMS[blockType].every((q) => answers[q.id]);

  const handleContinue = () => {
    const session = getCurrentSession();
    if (!session) {
      router.push('/consent');
      return;
    }
    updateSession({ tempSurvey: answers });
    router.push(`/draw${capitalize(blockType)}`);
  };

  return (
    <main className="flex flex-col gap-6 p-8">
      {ITEMS[blockType].map((q) => (
        <fieldset key={q.id} className="flex flex-col gap-2">
          <legend>{q.prompt}</legend>
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((v) => (
              <label key={v} className="flex flex-col items-center gap-1">
                <input
                  type="radio"
                  name={q.id}
                  value={v}
                  checked={answers[q.id] === String(v)}
                  onChange={(e) => handleRadio(q.id, e.target.value)}
                />
                {v}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <button
        className="self-start rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-40"
        disabled={!allDone}
        onClick={handleContinue}
      >
        Continue
      </button>
    </main>
  );
};

export default Survey;
