"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BlockType } from "@/utils/sessionData";
import { capitalize } from "@/utils/capitalize";

const Prep = ({ blockType }: { blockType: BlockType }) => {
    const router = useRouter();
    const [secondsLeft, setSecondsLeft] = useState(10);

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
            In the next screen you'll read a short description of a{" "}
            <strong>{blockType}</strong> individual. Imagine what this person looks
            like and acts like—you'll draw them later.
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