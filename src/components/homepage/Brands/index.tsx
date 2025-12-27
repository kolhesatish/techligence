import React from "react";

const brandsData = [
  { id: "robots", label: "ROBOTS" },
  { id: "systems", label: "SYSTEMS" },
  { id: "security", label: "SECURITY" },
];

const Brands = () => {
  return (
    <div className="bg-techSection">
      <div className="max-w-frame mx-auto flex items-center justify-center py-6 sm:px-4 xl:px-0">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {brandsData.map((brand, index) => (
            <React.Fragment key={brand.id}>
              <span className="text-white text-lg md:text-2xl font-semibold tracking-widest">
                {brand.label}
              </span>

              {/* Separator | except after last item */}
              {index !== brandsData.length - 1 && (
                <span className="text-white text-lg md:text-2xl font-semibold">
                  |
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Brands;
