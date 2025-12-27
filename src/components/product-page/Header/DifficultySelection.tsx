"use client";

import {
  Difficulty,
  setDifficultySelection,
} from "@/lib/features/products/productsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";

import { RootState } from "@/lib/store";
import { cn } from "@/lib/utils";
import React from "react";
import { IoMdCheckmark } from "react-icons/io";

const difficultyData: Difficulty[] = [
  {
    name: "Beginner",
    code: "bg-green-600",
  },
  {
    name: "Intermediate",
    code: "bg-yellow-500",
  },
  {
    name: "Advanced",
    code: "bg-red-600",
  },
];

const DifficultySelection = () => {
  const { difficultySelection } = useAppSelector(
    (state: RootState) => state.products
  );
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col">
      <span className="text-sm sm:text-base text-black/60 mb-4">
        Select Difficulty Level
      </span>

      <div className="flex items-center flex-wrap space-x-3 sm:space-x-4">
        {difficultyData.map((level, index) => (
          <button
            key={index}
            type="button"
            className={cn(
              level.code,
              "rounded-full w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center"
            )}
            onClick={() => dispatch(setDifficultySelection(level))}
          >
            {difficultySelection?.name === level.name && (
              <IoMdCheckmark className="text-base text-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelection;
