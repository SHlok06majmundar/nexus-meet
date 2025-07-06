'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QuickNavCardProps {
  className?: string;
  img: string;
  title: string;
  description: string;
  href: string;
  count?: number;
}

const QuickNavCard = ({
  className,
  img,
  title,
  description,
  href,
  count,
}: QuickNavCardProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'block w-full transform cursor-pointer rounded-2xl border border-white/10 px-6 py-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl',
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex-center glassmorphism size-16 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md">
          <Image
            src={img}
            alt={title}
            width={32}
            height={32}
            className="brightness-0 invert filter"
          />
        </div>
        {count !== undefined && (
          <span className="text-2xl font-bold text-white">{count}</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-white drop-shadow-lg">{title}</h3>
        <p className="text-sm font-medium leading-relaxed text-white/80">
          {description}
        </p>
      </div>
    </Link>
  );
};

export default QuickNavCard;
