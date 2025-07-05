"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { avatarImages } from "@/constants";
import { useToast } from "./ui/use-toast";
import ShareButton from "./ShareButton";

interface MeetingCardProps {
  title: string;
  date: string;
  icon: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
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
}: MeetingCardProps) => {
  const { toast } = useToast();

  return (
    <section className="flex min-h-[280px] w-full flex-col justify-between rounded-2xl bg-gradient-to-br from-dark-1/80 to-dark-2/80 backdrop-blur-lg border border-white/10 px-6 py-8 xl:max-w-[580px] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <article className="flex flex-col gap-6">
        <div className="bg-gradient-to-br from-blue-1 to-purple-1 p-3 rounded-xl w-fit">
          <Image src={icon} alt="meeting type" width={28} height={28} className="filter brightness-0 invert" />
        </div>
        <div className="flex justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-base font-medium text-white/80">{date}</p>
          </div>
        </div>
      </article>
      <article className={cn("flex justify-center relative", {})}>
        <div className="relative flex w-full max-sm:hidden">
          {avatarImages.map((img, index) => (
            <Image
              key={index}
              src={img}
              alt="attendees"
              width={44}
              height={44}
              className={cn("rounded-full border-2 border-white/30", { absolute: index > 0 })}
              style={{ top: 0, left: index * 32 }}
            />
          ))}
          <div className="flex-center absolute left-[148px] size-11 rounded-full border-2 border-white/30 bg-gradient-to-br from-purple-1 to-pink-1 text-white font-semibold text-sm">
            +5
          </div>
        </div>
        {!isPreviousMeeting && (
          <div className="flex gap-3 flex-wrap meeting-card-buttons">
            <Button onClick={handleClick} className="rounded-xl bg-gradient-to-r from-blue-1 to-purple-1 hover:from-blue-2 hover:to-purple-2 px-6 py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
              {buttonIcon1 && (
                <Image src={buttonIcon1} alt="feature" width={20} height={20} className="filter brightness-0 invert" />
              )}
              {buttonIcon1 && <span className="w-2" />}
              {buttonText}
            </Button>
            
            <ShareButton 
              meetingLink={link}
              meetingTitle={title}
            />
            
            <Button
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast({
                  title: "Link Copied",
                });
              }}
              className="bg-gradient-to-r from-green-1 to-green-2 hover:from-green-2 hover:to-green-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Image
                src="/icons/copy.svg"
                alt="copy"
                width={20}
                height={20}
                className="filter brightness-0 invert"
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
