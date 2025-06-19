"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BlockType } from "@/utils/sessionData";
import { capitalize } from "@/utils/capitalize";

const VIGNETTES: Record<BlockType, string> = {
  control: "John is an average person you might pass on the street …",
  prestige:
    "John is widely respected for his expertise and often mentors others …",
  dominance:
    "John commands attention by asserting himself forcefully in meetings …",
};

const Vignette = ({ blockType }: { blockType: BlockType }) => {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(15);

  // save start time in session temp field
  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("session") || "{}");
    s.tempVignetteStart = Date.now();
    localStorage.setItem("session", JSON.stringify(s));
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  return (
    <main className="flex flex-col items-center gap-6 p-8">
      <article className="max-w-2xl">{VIGNETTES[blockType]}</article>

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
