import Image from 'next/image';
import Link from 'next/link';
import { SignedIn, UserButton } from '@clerk/nextjs';

import MobileNav from './MobileNav';

const Navbar = () => {
  return (
    <nav className="flex-between fixed z-50 w-full bg-gradient-to-r from-dark-1/95 to-dark-2/95 backdrop-blur-lg px-6 py-4 lg:px-10 border-b border-white/10">
      <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
        <div className="bg-gradient-to-br from-blue-1 to-purple-1 p-2 rounded-xl">
          <Image
            src="/icons/logo.svg"
            width={28}
            height={28}
            alt="nexus meet logo"
            className="max-sm:size-8 filter brightness-0 invert"
          />
        </div>
        <p className="text-[28px] font-extrabold bg-gradient-to-r from-blue-3 to-purple-3 bg-clip-text text-transparent max-sm:hidden">
          NEXUS MEET
        </p>
      </Link>
      <div className="flex-between gap-5">
        <SignedIn>
          <div className="bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
            <UserButton 
              afterSignOutUrl="/sign-in" 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </div>
        </SignedIn>

        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
