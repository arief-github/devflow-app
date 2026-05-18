import Link from "next/link";
import Image from "next/image";
import Theme from "./Theme";
import AuthSection from "./AuthSection";
import MobileNav from "./MobileNav";
import GlobalSearch from "./GlobalSearch";

const Navbar = () => {
  return (
    <nav className="flex-between background-light900_dark200 fixed z-50 w-full gap-5 py-6 px-4 shadow-light-300 dark:shadow-none sm:px-12">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/images/site-logo.svg"
          width={23}
          height={23}
          alt="DevFlow"
        />
        <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden">
          Dev<span className="text-primary-500">Overflow</span>
        </p>
      </Link>

      <GlobalSearch />

      <div className="flex-between gap-1 sm:gap-5">
        {/* Theme */}
        <Theme />
        {/* User Button */}
        <div className="flex items-center justify-end min-w-[40px] min-h-[40px]">
          <AuthSection />

          <MobileNav />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
