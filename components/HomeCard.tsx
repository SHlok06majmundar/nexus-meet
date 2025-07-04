'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

interface HomeCardProps {
  className?: string;
  img: string;
  title: string;
  description: string;
  handleClick?: () => void;
}

const HomeCard = ({ className, img, title, description, handleClick }: HomeCardProps) => {
  return (
    <section
      className={cn(
        'bg-orange-1 px-6 py-8 flex flex-col justify-between w-full xl:max-w-[300px] min-h-[280px] rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex-center glassmorphism size-16 rounded-2xl backdrop-blur-md bg-white/20 border border-white/30">
        <Image src={img} alt="meeting" width={32} height={32} className="filter brightness-0 invert" />
      </div>
      
      <div className="flex flex-col gap-3 mt-4">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">{title}</h1>
        <p className="text-lg font-medium text-white/90 leading-relaxed">{description}</p>
      </div>
    </section>
  );
};

export default HomeCard;
