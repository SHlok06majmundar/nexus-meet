'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between border-r border-white/10 bg-gradient-to-b from-dark-1 to-dark-2 p-6 pt-28 text-white backdrop-blur-lg max-sm:hidden lg:w-[280px]">
      <div className="flex flex-1 flex-col gap-6">
        {sidebarLinks.map((item) => {
          const isActive =
            pathname === item.route ||
            (pathname && pathname.startsWith(`${item.route}/`));

          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn(
                'flex items-center justify-start gap-4 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10',
                {
                  'bg-gradient-to-r from-blue-1 to-purple-1 shadow-lg':
                    isActive,
                }
              )}
            >
              <div
                className={cn('rounded-xl p-2 transition-all duration-300', {
                  'bg-white/20': isActive,
                  'bg-white/10': !isActive,
                })}
              >
                <Image
                  src={item.imgURL}
                  alt={item.label}
                  width={24}
                  height={24}
                  className={cn('transition-all duration-300', {
                    'brightness-0 invert filter': isActive,
                    'opacity-70 brightness-0 invert filter': !isActive,
                  })}
                />
              </div>
              <p
                className={cn(
                  'text-lg font-semibold transition-all duration-300 max-lg:hidden',
                  {
                    'text-white': isActive,
                    'text-white/80': !isActive,
                  }
                )}
              >
                {item.label}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Sidebar;
