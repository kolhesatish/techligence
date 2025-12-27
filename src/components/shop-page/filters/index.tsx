import React from "react";
import RobotCategorySection from "@/components/shop-page/filters/RobotCategorySection";
import PriceSection from "@/components/shop-page/filters/PriceSection";
import DifficultySection from "@/components/shop-page/filters/DifficultySection";
import ApplicationSection from "@/components/shop-page/filters/ApplicationSection";
import ControllerSection from "@/components/shop-page/filters/ControllerSection";
import { Button } from "@/components/ui/button";

const Filters = () => {
  return (
    <>
      <hr className="border-t-black/10" />

      {/* Robot Categories */}
      <RobotCategorySection />

      <hr className="border-t-black/10" />

      {/* Price Range */}
      <PriceSection />

      <hr className="border-t-black/10" />

      {/* Difficulty Level */}
      <DifficultySection />

      <hr className="border-t-black/10" />

      {/* Application Type */}
      <ApplicationSection />

      <hr className="border-t-black/10" />

      {/* Controller Type */}
      <ControllerSection />

      <Button
        type="button"
        className="bg-black w-full rounded-full text-sm font-medium py-4 h-12 mt-4"
      >
        Apply Filters
      </Button>
    </>
  );
};

export default Filters;
