import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import DressStyle from "@/components/homepage/RobotCategory";
import Header from "@/components/homepage/Header";
import Reviews from "@/components/homepage/Reviews";
import { Product } from "@/types/product.types";
import { Review } from "@/types/review.types";

export const newArrivalsData: Product[] = [
  {
    id: 1,
    title: "MiniDuck Robot",
    srcUrl: "/images/miniduck.jpeg",
    gallery: ["/images/miniduck.jpeg", "/images/miniduck1.jpeg", "/images/miniduck2.jpeg"],
    price: 24,
    discount: { amount: 0, percentage: 0 },
    rating: 4.5,
  },
  {
    id: 2,
    title: "ComboBot - Object Avoider + Line Follower",
    srcUrl: "/images/combobot.jpeg",
    gallery: ["/images/combobot.jpeg", "/images/combobot1.jpeg", "/images/combobot.jpeg", "/images/combobot3.jpeg"],
    price: 54,
    discount: { amount: 0, percentage: 20 },
    rating: 3.5,
  },
  {
    id: 3,
    title: "Mobile Robot Chassis GR1",
    srcUrl: "/images/mobrobot.jpeg",
    gallery: ["/images/mobrobot.jpeg", "/images/mobrobot1.jpeg", "/images/mobrobot3.jpeg"],
    price: 46,
    discount: { amount: 0, percentage: 0 },
    rating: 4.5,
  },
  {
    id: 4,
    title: "Smart Robot Actuator P2",
    srcUrl: "/images/actuator1.jpeg",
    gallery: ["/images/actuator1.jpeg", "/images/actuator2.jpeg"],
    price: 36,
    discount: { amount: 0, percentage: 30 },
    rating: 4.5,
  },
];

export const topSellingData: Product[] = [
  {
    id: 5,
    title: "PIHU 1 Humanoid Robot",
    srcUrl: "/images/pihu.jpeg",
    gallery: ["/images/pihu.jpeg", "/images/pihu1.jpeg", "/images/pihu2.jpeg", "/images/pihu3.jpeg"],
    price: 120,
    discount: { amount: 0, percentage: 20 },
    rating: 5.0,
  },
  {
    id: 6,
    title: "3D Printed Human Mask",
    srcUrl: "/images/mask.jpeg",
    gallery: ["/images/mask.jpeg", "/images/mask1.jpeg", "/images/maks2.jpeg", "/images/maks2.jpeg"],
    price: 90,
    discount: { amount: 0, percentage: 0 },
    rating: 4.0,
  },
  {
    id: 7,
    title: "ComboBot - Object Avoider + Line Follower",
    srcUrl: "/images/combobot.jpeg",
    gallery: ["/images/combobot.jpeg", "/images/combobot1.jpeg", "/images/combobot.jpeg", "/images/combobot3.jpeg"],
    price: 43,
    discount: { amount: 0, percentage: 0 },
    rating: 3.0,
  },
  {
    id: 8,
    title: "4 Finger Robot Hand",
    srcUrl: "/images/fingerrobo.jpeg",
    gallery: ["/images/fingerrobo.jpeg", "/images/fingerrobo1.jpeg", "/images/fingerrobo2.jpeg", "/images/fingrobo.jpeg"],
    price: 40,
    discount: { amount: 0, percentage: 0 },
    rating: 4.5,
  },
];

export const relatedProductData: Product[] = [
  {
    id: 12,
    title: "Modular Robotics Kit",
    srcUrl: "/images/modular.jpeg",
    gallery: ["/images/modular.jpeg", "/images/modular1.jpeg", "/images/modular2.jpeg", "/images/modular3.jpeg"],
    price: 35,
    discount: { amount: 0, percentage: 20 },
    rating: 4.0,
  },
  {
    id: 13,
    title: "Biped Robot v1",
    srcUrl: "/images/biped.jpeg",
    gallery: ["/images/biped.jpeg", "/images/biped1.jpeg", "/images/biped2.jpeg"],
    price: 45,
    discount: { amount: 0, percentage: 0 },
    rating: 3.5,
  },
  {
    id: 14,
    title: "Robot Dog Proto X1",
    srcUrl: "/images/robodog.jpeg",
    gallery: ["/images/robodog.jpeg", "/images/robodog1.jpeg"],
    price: 80,
    discount: { amount: 0, percentage: 0 },
    rating: 4.5,
  },
  {
    id: 15,
    title: "Smart Robot Actuator P1",
    srcUrl: "/images/actuatorp2.jpeg",
    gallery: ["/images/actuatorp2.jpeg", "/images/actuatorp21.jpeg", "/images/actuatorp22.jpeg", "/images/actuatorp23.jpeg"],
    price: 150,
    discount: { amount: 0, percentage: 30 },
    rating: 5.0,
  },
];

export const reviewsData: Review[] = [
  {
    id: 1,
    user: "Alex K.",
    content:
      '"Techligence exceeded my expectations with their clean architecture and attention to detail. The team understands requirements quickly and delivers scalable, high-quality solutions. Their professionalism and technical expertise truly stand out.”',
    rating: 5,
    date: "August 14, 2023",
  },
  {
    id: 2,
    user: "Sarah M.",
    content:
      "What I appreciated most about Techligence is their clear communication and timely delivery. They transformed our ideas into a functional, modern product while keeping everything user-friendly and efficient.",
    rating: 5,
    date: "August 15, 2023",
  },
  {
    id: 3,
    user: "Ethan R.",
    content:
      "Techligence has a strong eye for both design and performance. The solution they delivered was intuitive, robust, and future-ready.",
    rating: 5,
    date: "August 16, 2023",
  },
  {
    id: 4,
    user: "Olivia P.",
    content:
      "The Techligence team brings creativity and technical depth together. They not only solved our business challenges but also suggested improvements.",
    rating: 5,
    date: "August 17, 2023",
  },
  {
    id: 5,
    user: "Liam K.",
    content:
      "From planning to deployment, Techligence maintained exceptional quality standards.",
    rating: 5,
    date: "August 18, 2023",
  },
  {
    id: 6,
    user: "Samantha D.",
    content:
      "Techligence exceeded my expectations with their clean architecture and attention to detail.",
    rating: 5,
    date: "August 19, 2023",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <Brands />

      {/* UI-only change: slightly more breathing space + softer divider */}
      <main className="my-[60px] sm:my-[90px]">

        <ProductListSec
          title="NEW ARRIVALS"
          data={newArrivalsData}
          viewAllLink="/shop#new-arrivals"
        />

        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-px border-gray-200 my-12 sm:my-18" />
        </div>

        <div className="mb-[60px] sm:mb-24">
          <ProductListSec
            title="top selling"
            data={topSellingData}
            viewAllLink="/shop#top-selling"
          />
        </div>

        <div className="mb-[60px] sm:mb-24">
          <DressStyle />
        </div>

        <Reviews data={reviewsData} />
      </main>
    </>
  );
}
