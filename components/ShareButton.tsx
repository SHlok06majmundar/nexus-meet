'use client';

import { useState } from 'react';
import {
  Share2,
  Mail,
  MessageCircle,
  Copy,
  Facebook,
  Twitter,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useToast } from './ui/use-toast';

interface ShareButtonProps {
  meetingLink: string;
  meetingTitle?: string;
}

const ShareButton = ({
  meetingLink,
  meetingTitle = 'Join my meeting',
}: ShareButtonProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: Copy,
      action: () => {
        navigator.clipboard.writeText(meetingLink);
        toast({
          title: 'Link Copied!',
          description: 'Meeting link has been copied to clipboard',
        });
        setIsOpen(false);
      },
      color: 'from-blue-1 to-blue-2',
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => {
        const subject = encodeURIComponent(meetingTitle);
        const body = encodeURIComponent(
          `You're invited to join my meeting!\n\nMeeting Link: ${meetingLink}\n\nJoin now to start the conversation.`
        );
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        setIsOpen(false);
      },
      color: 'from-red-500 to-red-600',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: () => {
        const text = encodeURIComponent(
          `${meetingTitle}\n\nJoin my meeting: ${meetingLink}`
        );
        window.open(`https://wa.me/?text=${text}`, '_blank');
        setIsOpen(false);
      },
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Telegram',
      icon: MessageCircle,
      action: () => {
        const text = encodeURIComponent(
          `${meetingTitle}\n\nJoin my meeting: ${meetingLink}`
        );
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(meetingLink)}&text=${text}`,
          '_blank'
        );
        setIsOpen(false);
      },
      color: 'from-blue-400 to-blue-500',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => {
        const text = encodeURIComponent(
          `${meetingTitle}\n\nJoin my meeting: ${meetingLink}`
        );
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
        setIsOpen(false);
      },
      color: 'from-sky-400 to-sky-500',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(meetingLink)}`,
          '_blank'
        );
        setIsOpen(false);
      },
      color: 'from-blue-600 to-blue-700',
    },
  ];

  const handleNativeShare = () => {
    if (
      typeof navigator !== 'undefined' &&
      'share' in navigator &&
      navigator.share
    ) {
      navigator
        .share({
          title: meetingTitle,
          text: 'Join my meeting on Nexus Meet',
          url: meetingLink,
        })
        .catch((error) => {
          console.log('Error sharing:', error);
        });
    }
  };

  const canUseNativeShare =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'share' in navigator;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          title="Share Meeting Link"
          className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/20 bg-gradient-to-r from-orange-1/80 to-orange-2/80 px-4 py-3 shadow-lg backdrop-blur-md transition-all duration-300 hover:from-orange-1 hover:to-orange-2"
        >
          <Share2 size={20} className="text-white" />
          <span className="hidden font-medium text-white sm:block">Share</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="share-dropdown mb-2 w-48 rounded-xl border-white/20 bg-dark-1/95 text-white backdrop-blur-md"
        align="center"
      >
        <div className="p-2">
          <div className="mb-2 px-2 text-sm font-semibold text-white/90">
            Share Meeting
          </div>

          {/* Native Share (mobile) */}
          {canUseNativeShare && (
            <>
              <DropdownMenuItem
                onClick={handleNativeShare}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-white/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-1 to-purple-2">
                  <Share2 size={16} className="text-white" />
                </div>
                <span>Share...</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 border-white/20" />
            </>
          )}

          {shareOptions.map((option, index) => (
            <DropdownMenuItem
              key={option.name}
              onClick={option.action}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-white/10"
            >
              <div
                className={`h-8 w-8 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center`}
              >
                <option.icon size={16} className="text-white" />
              </div>
              <span>{option.name}</span>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator className="my-1 border-white/20" />

          {/* Direct Link Display */}
          <div className="p-2">
            <div className="mb-1 text-xs text-white/60">Meeting Link:</div>
            <div className="break-all rounded bg-white/10 p-2 font-mono text-xs text-white/80">
              {meetingLink}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
