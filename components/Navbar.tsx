import Image from 'next/image';
import Link from 'next/link';
import { SignedIn, UserButton } from '@clerk/nextjs';

import MobileNav from './MobileNav';

const Navbar = () => {
  return (
    <nav className="flex-between fixed z-50 w-full border-b border-white/10 bg-gradient-to-r from-dark-1/95 to-dark-2/95 px-6 py-4 backdrop-blur-lg lg:px-10">
      <Link
        href="/"
        className="flex items-center gap-3 transition-transform duration-300 hover:scale-105"
      >
        <div className="rounded-xl bg-gradient-to-br from-blue-1 to-purple-1 p-2">
          <Image
            src="/icons/logo.jpeg"
            width={32}
            height={32}
            alt="nexus meet logo"
            className="rounded-md max-sm:size-8"
          />
        </div>
        <p className="bg-gradient-to-r from-blue-3 to-purple-3 bg-clip-text text-[28px] font-extrabold text-transparent max-sm:hidden">
          NEXUS MEET
        </p>
      </Link>
      <div className="flex-between gap-5">
        <SignedIn>
          <div className="rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-md">
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                },
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
