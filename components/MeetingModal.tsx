"use client";
import { ReactNode } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import Image from "next/image";

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
      <DialogContent className="flex w-full max-w-[560px] flex-col gap-8 border border-white/20 bg-gradient-to-br from-dark-1/95 to-dark-2/95 backdrop-blur-lg px-8 py-10 text-white rounded-3xl shadow-2xl">
        <div className="flex flex-col gap-6">
          {image && (
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-green-1 to-green-2 p-4 rounded-full">
                <Image src={image} alt="checked" width={48} height={48} className="filter brightness-0 invert" />
              </div>
            </div>
          )}
          <h1 className={cn("text-3xl font-bold leading-[42px] bg-gradient-to-r from-blue-3 to-purple-3 bg-clip-text text-transparent", className)}>
            {title}
          </h1>
          {children}
          <Button
            className={cn(
              "bg-gradient-to-r from-blue-1 to-purple-1 hover:from-blue-2 hover:to-purple-2 focus-visible:ring-0 focus-visible:ring-offset-0 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl",
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
                className="filter brightness-0 invert"
              />
            )}
            {buttonIcon && <span className="w-2" />}
            {buttonText || "Schedule Meeting"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingModal;
