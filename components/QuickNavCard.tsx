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

const QuickNavCard = ({ className, img, title, description, href, count }: QuickNavCardProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'block px-6 py-8 w-full rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/10',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-center glassmorphism size-16 rounded-2xl backdrop-blur-md bg-white/20 border border-white/30">
          <Image src={img} alt={title} width={32} height={32} className="filter brightness-0 invert" />
        </div>
        {count !== undefined && (
          <span className="text-2xl font-bold text-white">{count}</span>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-white drop-shadow-lg">{title}</h3>
        <p className="text-sm font-medium text-white/80 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
};

export default QuickNavCard;
