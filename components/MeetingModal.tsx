'use client';
import { ReactNode } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import Image from 'next/image';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  handleClick?: () => void;
  buttonText?: string;
  instantMeeting?: boolean;
  image?: string;
  buttonClassName?: string;
  buttonIcon?: string;
}

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  className,
  children,
  handleClick,
  buttonText,
  instantMeeting,
  image,
  buttonClassName,
  buttonIcon,
}: MeetingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex w-full max-w-[560px] flex-col gap-8 rounded-3xl border border-white/20 bg-gradient-to-br from-dark-1/95 to-dark-2/95 px-8 py-10 text-white shadow-2xl backdrop-blur-lg">
        <div className="flex flex-col gap-6">
          {image && (
            <div className="flex justify-center">
              <div className="rounded-full bg-gradient-to-br from-green-1 to-green-2 p-4">
                <Image
                  src={image}
                  alt="checked"
                  width={48}
                  height={48}
                  className="brightness-0 invert filter"
                />
              </div>
            </div>
          )}
          <h1
            className={cn(
              'bg-gradient-to-r from-blue-3 to-purple-3 bg-clip-text text-3xl font-bold leading-[42px] text-transparent',
              className
            )}
          >
            {title}
          </h1>
          {children}
          <Button
            className={cn(
              'rounded-xl bg-gradient-to-r from-blue-1 to-purple-1 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-2 hover:to-purple-2 hover:shadow-xl focus-visible:ring-0 focus-visible:ring-offset-0',
              buttonClassName
            )}
            onClick={handleClick}
          >
            {buttonIcon && (
              <Image
                src={buttonIcon}
                alt="button icon"
                width={16}
                height={16}
                className="brightness-0 invert filter"
              />
            )}
            {buttonIcon && <span className="w-2" />}
            {buttonText || 'Schedule Meeting'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingModal;
