import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { FiSliders } from "react-icons/fi";
import Filters from ".";

const MobileFilters = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="h-8 w-8 rounded-full bg-[#F0F0F0] text-black p-1 md:hidden"
          aria-label="Open robot filters"
        >
          <FiSliders className="text-base mx-auto" />
        </button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[90%]">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <span className="font-bold text-black text-xl">
              Robot Filters
            </span>
            <FiSliders className="text-2xl text-black/40" />
          </div>

          <DrawerTitle className="hidden">
            Robot Filters
          </DrawerTitle>
          <DrawerDescription className="hidden">
            Filter robots by category, application and price
          </DrawerDescription>
        </DrawerHeader>

        {/* Filters content */}
        <div className="max-h-[90%] overflow-y-auto w-full px-5 md:px-6 py-5 space-y-5 md:space-y-6">
          <Filters />
        </div>

        {/* Optional footer */}
        <DrawerFooter className="px-5 pb-5">
          <DrawerClose asChild>
            <button
              type="button"
              className="w-full rounded-full border border-black/20 text-sm py-3 font-medium"
            >
              Close
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileFilters;
