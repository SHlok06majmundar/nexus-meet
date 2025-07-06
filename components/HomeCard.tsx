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

const HomeCard = ({
  className,
  img,
  title,
  description,
  handleClick,
}: HomeCardProps) => {
  return (
    <section
      className={cn(
        'flex min-h-[280px] w-full cursor-pointer flex-col justify-between rounded-2xl bg-orange-1 px-6 py-8 shadow-lg transition-all duration-300 hover:shadow-2xl xl:max-w-[300px]',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex-center glassmorphism size-16 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md">
        <Image
          src={img}
          alt="meeting"
          width={32}
          height={32}
          className="brightness-0 invert filter"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">
          {title}
        </h1>
        <p className="text-lg font-medium leading-relaxed text-white/90">
          {description}
        </p>
      </div>
    </section>
  );
};

export default HomeCard;
