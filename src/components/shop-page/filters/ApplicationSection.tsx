import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";

type Application = {
  title: string;
  slug: string;
};

const applicationData: Application[] = [
  {
    title: "Education",
    slug: "/shop?application=education",
  },
  {
    title: "Research & Development",
    slug: "/shop?application=research",
  },
  {
    title: "Industrial Automation",
    slug: "/shop?application=industrial",
  },
  {
    title: "Hobby & DIY",
    slug: "/shop?application=hobby",
  },
];

const ApplicationSection = () => {
  return (
    <Accordion type="single" collapsible defaultValue="filter-application">
      <AccordionItem value="filter-application" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Application
        </AccordionTrigger>

        <AccordionContent className="pt-4 pb-0">
          <div className="flex flex-col text-black/70 space-y-0.5">
            {applicationData.map((app, idx) => (
              <Link
                key={idx}
                href={app.slug}
                className="flex items-center justify-between py-2 hover:text-black transition-colors"
              >
                {app.title}
                <MdKeyboardArrowRight />
              </Link>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ApplicationSection;
