"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { setControllerSelection } from "@/lib/features/products/productsSlice";

const controllerTypes = [
  "Arduino",
  "Raspberry Pi",
  "ESP32",
  "Jetson Nano",
  "Custom Controller",
];

const ControllerSelection = () => {
  const { controllerSelection } = useAppSelector(
    (state: RootState) => state.products
  );
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col">
      <span className="text-sm sm:text-base text-black/60 mb-4">
        Choose Controller Type
      </span>

      <div className="flex items-center flex-wrap lg:space-x-3">
        {controllerTypes.map((controller) => (
          <button
            key={controller}
            type="button"
            className={cn(
              "bg-[#F0F0F0] flex items-center justify-center px-5 lg:px-6 py-2.5 lg:py-3 text-sm lg:text-base rounded-full m-1 lg:m-0 max-h-[46px]",
              controllerSelection?.name === controller &&
                "bg-black font-medium text-white"
            )}
            onClick={() =>
              dispatch(setControllerSelection({ name: controller }))
            }
          >
            {controller}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ControllerSelection;
