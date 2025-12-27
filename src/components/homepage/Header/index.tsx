import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import * as motion from "framer-motion/client";

const Header = () => {
  return (
    <header className="bg-white pt-16 md:pt-28 text-gray-900 overflow-hidden">
      <div className="max-w-frame mx-auto grid grid-cols-1 md:grid-cols-2 px-4">
        
        {/* LEFT */}
        <section className="font-heading">
          <motion.h2
            initial={{ y: 80, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-[64px] leading-tight mb-6"
          >
            Innovation Powered by{" "}
            <span className="text-blue-600">Artificial Intelligence</span>
          </motion.h2>

          <p className="font-body text-gray-600 max-w-xl mb-8">
            Revolutionizing industries with AI-powered robotics and intelligent
            automation systems built for the future.
          </p>

          <Link
            href="/solutions"
            className="inline-block bg-blue-600 text-white px-10 py-4 rounded-full hover:bg-blue-700 transition"
          >
            Explore Solutions
          </Link>

          <div className="flex gap-8 mt-14">
            <Stat label="Robots Deployed" value={200} />
            <Stat label="AI Solutions" value={2000} />
            <Stat label="Global Clients" value={3000} />
          </div>
        </section>

        {/* RIGHT */}
        <motion.section
          initial={{ y: 80, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative min-h-[420px]"
        >
          <Image
            src="/images/robot.jpg"
            alt="AI Robot"
            fill
            className="object-contain drop-shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
          />
        </motion.section>
      </div>
    </header>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div>
    <span className="text-3xl font-bold text-blue-600">
      <AnimatedCounter from={0} to={value} />+
    </span>
    <p className="text-gray-500 text-sm">{label}</p>
  </div>
);

export default Header;
