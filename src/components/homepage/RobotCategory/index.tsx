import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import React from "react";
import * as motion from "framer-motion/client";
import RobotCategoryCard from "./RobotCategoryCard";

const RobotCategories = () => {
  return (
    <div className="px-4 xl:px-0">
      <section className="max-w-frame mx-auto bg-[#F0F0F0] px-6 pb-6 pt-10 md:p-[70px] rounded-[40px] text-center">
        <motion.h2
          initial={{ y: "100px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={cn(
            integralCF.className,
            "text-[32px] leading-[36px] md:text-5xl mb-8 md:mb-14 uppercase"
          )}
        >
          BROWSE BY ROBOT CATEGORY
        </motion.h2>

        {/* Row 1 */}
        <motion.div
          initial={{ y: "100px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row md:h-[289px] space-y-4 sm:space-y-0 sm:space-x-5 mb-4 sm:mb-5"
        >
          <RobotCategoryCard
            title="Robotic Hands & Grippers"
            url="/shop?category=grippers-hands"
            className="md:max-w-[260px] lg:max-w-[360px] xl:max-w-[407px] h-[190px] bg-[url('/images/fingerrobo.jpeg')]"
          />

          <RobotCategoryCard
            title="Educational Robots"
            url="/shop?category=mobile-robots"
            className="md:max-w-[484px] h-[190px] xl:max-w-[407px] bg-[url('/images/miniduck.jpeg')]"
          />
        </motion.div>

        {/* Row 2 */}
        <motion.div
          initial={{ y: "100px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex flex-col sm:flex-row md:h-[289px] space-y-5 sm:space-y-0 sm:space-x-5"
        >
          <RobotCategoryCard
            title="Mobile Robots"
            url="/shop?category=mobile-robots"
            className="md:max-w-[684px] h-[190px] bg-[url('/images/combobot.jpeg')]"
          />

          <RobotCategoryCard
            title="Smart Actuators"
            url="/shop?category=robotic-arms-actuators"
            className="md:max-w-[260px] lg:max-w-[360px] xl:max-w-[407px] h-[190px] bg-[url('/images/actuator1.jpeg')]"
          />
        </motion.div>
      </section>
    </div>
  );
};

export default RobotCategories;
