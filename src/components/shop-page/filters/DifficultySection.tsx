"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IoMdCheckmark } from "react-icons/io";
import { cn } from "@/lib/utils";

type Difficulty = {
  label: string;
  value: string;
};

const difficultyLevels: Difficulty[] = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

const DifficultySection = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Accordion type="single" collapsible defaultValue="filter-difficulty">
      <AccordionItem value="filter-difficulty" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Difficulty Level
        </AccordionTrigger>

        <AccordionContent className="pt-4 pb-0">
          <div className="flex flex-col space-y-2">
            {difficultyLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setSelected(level.value)}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors",
                  selected === level.value
                    ? "border-black bg-black text-white"
                    : "border-black/20 text-black/70 hover:border-black"
                )}
              >
                {level.label}
                {selected === level.value && (
                  <IoMdCheckmark className="text-base" />
                )}
              </button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default DifficultySection;
