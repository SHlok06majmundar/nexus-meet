'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between bg-gradient-to-b from-dark-1 to-dark-2 p-6 pt-28 text-white max-sm:hidden lg:w-[280px] border-r border-white/10 backdrop-blur-lg">
      <div className="flex flex-1 flex-col gap-6">
        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
          
          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn(
                'flex gap-4 items-center p-4 rounded-2xl justify-start transition-all duration-300 hover:bg-white/10',
                {
                  'bg-gradient-to-r from-blue-1 to-purple-1 shadow-lg': isActive,
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
                  width={24}
                  height={24}
                  className={cn(
                    'transition-all duration-300',
                    {
                      'filter brightness-0 invert': isActive,
                      'filter brightness-0 invert opacity-70': !isActive,
                    }
                  )}
                />
              </div>
              <p className={cn(
                'text-lg font-semibold max-lg:hidden transition-all duration-300',
                {
                  'text-white': isActive,
                  'text-white/80': !isActive,
                }
              )}>
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
