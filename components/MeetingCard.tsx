'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { avatarImages } from '@/constants';
import { useToast } from './ui/use-toast';
import ShareButton from './ShareButton';

interface MeetingCardProps {
  title: string;
  date: string;
  icon: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
  onDelete?: () => void;
}

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  buttonIcon1,
  handleClick,
  link,
  buttonText,
  onDelete,
}: MeetingCardProps) => {
  const { toast } = useToast();

  return (
    <section className="flex min-h-[280px] w-full flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-dark-1/80 to-dark-2/80 px-6 py-8 shadow-xl backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl xl:max-w-[580px]">
      <article className="flex flex-col gap-6">
        <div className="w-fit rounded-xl bg-gradient-to-br from-blue-1 to-purple-1 p-3">
          <Image
            src={icon}
            alt="meeting type"
            width={28}
            height={28}
            className="brightness-0 invert filter"
          />
        </div>
        <div className="flex justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-base font-medium text-white/80">{date}</p>
          </div>
        </div>
      </article>
      <article className={cn('relative flex justify-center', {})}>
        <div className="relative flex w-full max-sm:hidden">
          {avatarImages.map((img, index) => (
            <Image
              key={index}
              src={img}
              alt="attendees"
              width={44}
              height={44}
              className={cn('rounded-full border-2 border-white/30', {
                absolute: index > 0,
              })}
              style={{ top: 0, left: index * 32 }}
            />
          ))}
          <div className="flex-center absolute left-[148px] size-11 rounded-full border-2 border-white/30 bg-gradient-to-br from-purple-1 to-pink-1 text-sm font-semibold text-white">
            +5
          </div>
        </div>
        {!isPreviousMeeting && (
          <div className="meeting-card-buttons flex flex-wrap gap-3">
            <Button
              onClick={handleClick}
              className="rounded-xl bg-gradient-to-r from-blue-1 to-purple-1 px-6 py-3 font-semibold shadow-lg transition-all duration-300 hover:from-blue-2 hover:to-purple-2 hover:shadow-xl"
            >
              {buttonIcon1 && (
                <Image
                  src={buttonIcon1}
                  alt="feature"
                  width={20}
                  height={20}
                  className="brightness-0 invert filter"
                />
              )}
              {buttonIcon1 && <span className="w-2" />}
              {buttonText}
            </Button>

            <ShareButton meetingLink={link} meetingTitle={title} />

            {onDelete && (
              <Button
                onClick={onDelete}
                className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 font-semibold shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-xl"
              >
                <Trash2 size={20} className="text-white" />
                <span className="w-2" />
                Delete
              </Button>
            )}

            <Button
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast({
                  title: 'Link Copied',
                });
              }}
              className="rounded-xl bg-gradient-to-r from-green-1 to-green-2 px-6 py-3 font-semibold shadow-lg transition-all duration-300 hover:from-green-2 hover:to-green-1 hover:shadow-xl"
            >
              <Image
                src="/icons/copy.svg"
                alt="copy"
                width={20}
                height={20}
                className="brightness-0 invert filter"
              />
              <span className="w-2" />
              Copy Link
            </Button>
          </div>
        )}
      </article>
    </section>
  );
};

export default MeetingCard;
