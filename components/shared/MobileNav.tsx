"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "../ui/sheet";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import { sidebarLinks } from "@/constants";

// Icon Import
import HamburgeIcon from "@/public/icons/hamburger.svg";
import SiteLogo from "@/public/images/site-logo.svg";

const NavContent = () => {
  const pathname = usePathname();
  return (
    <section className="flex h-full flex-col gap-6 pt-16">
      {/* NavLinks */}
      {sidebarLinks.map((item) => {
        const isActive =
          (pathname.includes(item.route) && item.route.length > 1) ||
          pathname === item.route;
        return (
          <SheetClose asChild key={item.route}>
            <Link
              href={item.route}
              className={`flex items-center justify-start gap-4 bg-transparent p-4 ${isActive ? "primary-gradient rounded-lg text-light-900" : "text-dark300_light900"}`}
            >
              <Image
                src={item.imgURL}
                width={20}
                height={20}
                alt={item.label}
                className={`${isActive ? "" : "invert-colors"}`}
              />
              <p className={`${isActive ? "base-bold" : "base-medium"}`}>
                {item.label}
              </p>
            </Link>
          </SheetClose>
        );
      })}
    </section>
  );
};

const MobileNav = () => {
  const { isSignedIn } = useAuth();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Image
          src={HamburgeIcon}
          width={36}
          height={36}
          alt="Menu"
          className="invert-colors sm:hidden"
        />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="background-light900_dark200 border-none"
      >
        <SheetHeader>
          <Link href="/" className="flex items-center gap-1">
            <Image src={SiteLogo} width={23} height={23} alt="DevFlow" />
            <p className="h2-bold font-spaceGrotesk text-dark-100_light900">
              Dev<span className="text-primary-500">Flow</span>
            </p>
          </Link>
        </SheetHeader>
        <div className="px-4">
          <SheetClose asChild>
            <NavContent />
          </SheetClose>

          {!isSignedIn && (
            <div className="flex flex-col gap-3">
              <SheetClose asChild>
                <Link href="/sign-in">
                  <Button className="small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
                    <span className="primary-text-gradient">Login</span>
                  </Button>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link href="/sign-up">
                  <Button className="small-medium btn-tertiary text-dark400_light900 light-border-2 min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
                    Sign Up
                  </Button>
                </Link>
              </SheetClose>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
