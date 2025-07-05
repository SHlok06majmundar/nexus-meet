'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <section className="w-full max-w-[264px]">
      <Sheet>
        <SheetTrigger asChild>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20 sm:hidden">
            <Image
              src="/icons/hamburger.svg"
              width={28}
              height={28}
              alt="hamburger icon"
              className="cursor-pointer filter brightness-0 invert"
            />
          </div>
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-gradient-to-b from-dark-1 to-dark-2 backdrop-blur-lg">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-1 to-purple-1 p-2">
              <Image
                src="/icons/logo.jpeg"
                width={28}
                height={28}
                alt="nexus meet logo"
                className="rounded-md"
              />
            </div>
            <p className="bg-gradient-to-r from-blue-3 to-purple-3 bg-clip-text text-[24px] font-extrabold text-transparent">NEXUS MEET</p>
          </Link>
          <div className="flex h-[calc(100vh-120px)] flex-col justify-between overflow-y-auto">
            <SheetClose asChild>
              <section className="flex h-full flex-col gap-4 pt-8 text-white">
                {sidebarLinks.map((item) => {
                  const isActive = pathname === item.route;

                  return (
                    <SheetClose asChild key={item.route}>
                      <Link
                        href={item.route}
                        key={item.label}
                        className={cn(
                          'flex gap-4 items-center p-4 rounded-2xl w-full max-w-60 transition-all duration-300',
                          {
                            'bg-gradient-to-r from-blue-1 to-purple-1 shadow-lg': isActive,
                            'hover:bg-white/10': !isActive,
                          }
                        )}
                      >
                        <div className={cn(
                          'p-2 rounded-xl transition-all duration-300',
                          {
                            'bg-white/20': isActive,
                            'bg-white/10': !isActive,
                          }
                        )}>
                          <Image
                            src={item.imgURL}
                            alt={item.label}
                            width={20}
                            height={20}
                            className="filter brightness-0 invert"
                          />
                        </div>
                        <p className="font-semibold">{item.label}</p>
                      </Link>
                    </SheetClose>
                  );
                })}
              </section>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
