import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import React from "react";
import { PaymentBadge, SocialNetworks } from "./footer.types";
import { FaFacebookF, FaGithub, FaInstagram, FaTwitter } from "react-icons/fa";
import Link from "next/link";
import LinksSection from "./LinksSection";
import Image from "next/image";
import NewsLetterSection from "./NewsLetterSection";
import LayoutSpacing from "./LayoutSpacing";

const socialsData: SocialNetworks[] = [
  { id: 1, icon: <FaTwitter />, url: "https://twitter.com" },
  { id: 2, icon: <FaFacebookF />, url: "https://facebook.com" },
  { id: 3, icon: <FaInstagram />, url: "https://instagram.com" },
  { id: 4, icon: <FaGithub />, url: "https://github.com/mohammadoftadeh" },
];

const paymentBadgesData: PaymentBadge[] = [
  { id: 1, srcUrl: "/icons/Visa.svg" },
  { id: 2, srcUrl: "/icons/mastercard.svg" },
  { id: 3, srcUrl: "/icons/paypal.svg" },
  { id: 4, srcUrl: "/icons/applePay.svg" },
  { id: 5, srcUrl: "/icons/googlePay.svg" },
];

const Footer = () => {
  return (
    <footer className="mt-20 bg-white text-gray-700">
      {/* Newsletter */}
      <div className="relative">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gray-50" />
        <div className="px-4 relative z-10">
          <NewsLetterSection />
        </div>
      </div>

      {/* Main Footer */}
      <div className="pt-12 px-4 pb-6 bg-gray-50">
        <div className="max-w-frame mx-auto">
          <nav className="lg:grid lg:grid-cols-12 mb-10">
            {/* LEFT */}
            <div className="flex flex-col lg:col-span-3 lg:max-w-[248px]">
              <h1
                className={cn(
                  integralCF.className,
                  "text-[28px] lg:text-[32px] mb-6 text-gray-900"
                )}
              >
                TECHLIGENCE
              </h1>

              <p className="text-gray-500 text-sm mb-9">
                Technology solutions crafted for growth, performance, and trust.
              </p>

              <div className="flex items-center">
                {socialsData.map((social) => (
                  <Link
                    href={social.url}
                    key={social.id}
                    className="
                      mr-3 w-8 h-8 rounded-full
                      border border-gray-200
                      bg-white
                      text-gray-600
                      hover:bg-blue-600 hover:text-white
                      transition
                      flex items-center justify-center
                    "
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* LINKS */}
            <div className="hidden lg:grid col-span-9 lg:grid-cols-4 lg:pl-10">
              <LinksSection />
            </div>
            <div className="grid lg:hidden grid-cols-2 sm:grid-cols-4">
              <LinksSection />
            </div>
          </nav>

          {/* DIVIDER */}
          <hr className="h-px border-gray-200 mb-6" />

          {/* BOTTOM */}
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mb-2">
            <p className="text-sm text-center sm:text-left text-gray-500 mb-4 sm:mb-0">
              Techligence © Made by{" "}
              <Link
                href="https://github.com/mohammadoftadeh"
                className="text-gray-900 hover:text-blue-600 transition"
              >
                Kirti
              </Link>
              {", "}Designed by{" "}
              <Link
                href="https://www.figma.com/@hamzauix"
                className="text-gray-900 hover:text-blue-600 transition"
              >
                Satish
              </Link>
            </p>

            <div className="flex items-center">
              {paymentBadgesData.map((badge, _, arr) => (
                <span
                  key={badge.id}
                  className={cn(
                    arr.length !== badge.id && "mr-3",
                    "w-[46px] h-[30px] rounded-md border border-gray-200 bg-white flex items-center justify-center"
                  )}
                >
                  <Image
                    priority
                    src={badge.srcUrl}
                    width={33}
                    height={100}
                    alt="payment"
                    className="max-h-[15px] opacity-80"
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        <LayoutSpacing />
      </div>
    </footer>
  );
};

export default Footer;
