"use client";

import React from "react";
import * as motion from "framer-motion/client";
import ReviewCard from "@/components/common/ReviewCard";
import { Review } from "@/types/review.types";

type Props = { data: Review[] };

const Reviews = ({ data }: Props) => {
  return (
    <section className="bg-techDark py-24">
      <motion.h2
        initial={{ y: 80, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="font-heading text-techHeading text-center text-4xl mb-14"
      >
        What Our Clients Say
      </motion.h2>

      <div className="max-w-frame mx-auto grid md:grid-cols-3 gap-6 px-4">
        {data.map((review) => (
          <ReviewCard key={review.id} data={review} />
        ))}
      </div>
    </section>
  );
};

export default Reviews;
