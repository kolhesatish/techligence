"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const controllerTypes = [
  "Arduino",
  "Raspberry Pi",
  "ESP32",
  "Jetson Nano",
  "Custom Controller",
];

const ControllerSection = () => {
  const [selected, setSelected] = useState<string>("Arduino");

  return (
    <Accordion type="single" collapsible defaultValue="filter-controller">
      <AccordionItem value="filter-controller" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Controller Type
        </AccordionTrigger>

        <AccordionContent className="pt-4 pb-0">
          <div className="flex items-center flex-wrap">
            {controllerTypes.map((controller, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  "bg-[#F0F0F0] m-1 flex items-center justify-center px-5 py-2.5 text-sm rounded-full max-h-[39px] transition-colors",
                  selected === controller &&
                    "bg-black font-medium text-white"
                )}
                onClick={() => setSelected(controller)}
              >
                {controller}
              </button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ControllerSection;
