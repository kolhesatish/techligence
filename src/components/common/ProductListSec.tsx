import React from "react";
import * as motion from "framer-motion/client";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import ProductCard from "./ProductCard";
import { Product } from "@/types/product.types";
import Link from "next/link";

type ProductListSecProps = {
  title: string;
  data: Product[];
  viewAllLink?: string;
};

const ProductListSec = ({ title, data, viewAllLink }: ProductListSecProps) => {
  return (
    <section className="max-w-frame mx-auto text-center px-4 xl:px-0">
      {/* SECTION TITLE */}
      <motion.h2
        initial={{ y: "80px", opacity: 0 }}
        whileInView={{ y: "0", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={cn(
          integralCF.className,
          "text-[30px] md:text-5xl mb-6 md:mb-12 capitalize text-gray-900"
        )}
      >
        {title}
      </motion.h2>

      {/* PRODUCT SLIDER */}
      <motion.div
        initial={{ y: "80px", opacity: 0 }}
        whileInView={{ y: "0", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Carousel
          opts={{ align: "start" }}
          className="w-full mb-6 md:mb-10"
        >
          <CarouselContent className="space-x-4 sm:space-x-6">
            {data.map((product) => (
              <CarouselItem
                key={product.id}
                className="w-full max-w-[200px] sm:max-w-[300px] pl-0"
              >
                <ProductCard data={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* VIEW ALL BUTTON */}
        {viewAllLink && (
          <div className="w-full text-center">
            <Link
              href={viewAllLink}
              className="
                inline-flex items-center justify-center
                w-full sm:w-[220px]
                px-12 py-3.5
                border border-gray-300
                rounded-full
                text-gray-900
                font-medium
                text-sm sm:text-base
                hover:bg-gray-900 hover:text-white
                transition
              "
            >
              View All
            </Link>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default ProductListSec;
