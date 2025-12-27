import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Link from "next/link";
import React from "react";
import { NavMenu } from "../navbar.types";
import { MenuList } from "./MenuList";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MenuItem } from "./MenuItem";
import Image from "next/image";
import InputGroup from "@/components/ui/input-group";
import ResTopNavbar from "./ResTopNavbar";
import CartBtn from "./CartBtn";

const data: NavMenu = [
  {
    id: 1,
    label: "Shop",
    type: "MenuList",
    children: [
      {
        id: 11,
        label: "Autonomous Robots",
        url: "/shop#men-clothes",
        description: "Smart robots designed for navigation and automation",
      },
      {
        id: 12,
        label: "AI-Powered Systems",
        url: "/shop#women-clothes",
        description: "Intelligent solutions using AI and machine learning",
      },
      {
        id: 13,
        label: "Industrial Robotics",
        url: "/shop#kids-clothes",
        description: "Robots for manufacturing and warehouse automation",
      },
      {
        id: 14,
        label: "Security & Surveillance Robots",
        url: "/shop#bag-shoes",
        description: "Advanced robots for monitoring and safety",
      },
    ],
  },
  {
    id: 2,
    type: "MenuItem",
    label: "On Sale",
    url: "/shop#on-sale",
    children: [],
  },
  {
    id: 3,
    type: "MenuItem",
    label: "New Arrivals",
    url: "/shop#new-arrivals",
    children: [],
  },
  {
    id: 4,
    type: "MenuItem",
    label: "Innovation",
    url: "/shop#brands",
    children: [],
  },
];

const TopNavbar = () => {
  return (
    <nav
      className="
        sticky top-0 z-40
        bg-white
        border-b border-gray-200
        backdrop-blur-sm
      "
    >
      <div className="flex max-w-frame mx-auto items-center justify-between px-4 xl:px-0 py-4">

        {/* LEFT */}
        <div className="flex items-center">
          <div className="block md:hidden mr-4">
            <ResTopNavbar data={data} />
          </div>

          <Link
            href="/"
            className={cn(
              integralCF.className,
              "text-2xl lg:text-[32px] text-gray-900 hover:text-blue-600 transition"
            )}
          >
            Techligence
          </Link>
        </div>

        {/* CENTER MENU */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="flex items-center gap-8">
            {data.map((item) => (
              <React.Fragment key={item.id}>
                {item.type === "MenuItem" && (
                  <div className="text-gray-700 hover:text-blue-600 transition">
                    <MenuItem label={item.label} url={item.url} />
                  </div>
                )}

                {item.type === "MenuList" && (
                  <div className="text-gray-700 hover:text-blue-600 transition">
                    <MenuList data={item.children} label={item.label} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* SEARCH */}
          <InputGroup
            className="
              hidden md:flex
              bg-gray-100
              border border-gray-200
              rounded-full
              px-4
            "
          >
            <InputGroup.Text>
              <Image
                src="/icons/search.svg"
                height={18}
                width={18}
                alt="search"
                className="opacity-60"
              />
            </InputGroup.Text>
            <InputGroup.Input
              type="search"
              name="search"
              placeholder="Search for products..."
              className="bg-transparent text-gray-700 placeholder:text-gray-400"
            />
          </InputGroup>

          {/* CART */}
          <CartBtn />

          {/* USER */}
          <Link
            href="/#signin"
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <Image
              src="/icons/user.svg"
              height={22}
              width={22}
              alt="user"
              className="opacity-70"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
