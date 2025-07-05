'use client';

import { useState } from 'react';
import { Share2, Mail, MessageCircle, Copy, Facebook, Twitter } from 'lucide-react';
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

const ShareButton = ({ meetingLink, meetingTitle = "Join my meeting" }: ShareButtonProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: Copy,
      action: () => {
        navigator.clipboard.writeText(meetingLink);
        toast({
          title: "Link Copied!",
          description: "Meeting link has been copied to clipboard",
        });
        setIsOpen(false);
      },
      color: 'from-blue-1 to-blue-2'
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => {
        const subject = encodeURIComponent(meetingTitle);
        const body = encodeURIComponent(`You&apos;re invited to join my meeting!\n\nMeeting Link: ${meetingLink}\n\nJoin now to start the conversation.`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        setIsOpen(false);
      },
      color: 'from-red-500 to-red-600'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: () => {
        const text = encodeURIComponent(`${meetingTitle}\n\nJoin my meeting: ${meetingLink}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
        setIsOpen(false);
      },
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Telegram',
      icon: MessageCircle,
      action: () => {
        const text = encodeURIComponent(`${meetingTitle}\n\nJoin my meeting: ${meetingLink}`);
        window.open(`https://t.me/share/url?url=${encodeURIComponent(meetingLink)}&text=${text}`, '_blank');
        setIsOpen(false);
      },
      color: 'from-blue-400 to-blue-500'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => {
        const text = encodeURIComponent(`${meetingTitle}\n\nJoin my meeting: ${meetingLink}`);
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
        setIsOpen(false);
      },
      color: 'from-sky-400 to-sky-500'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(meetingLink)}`, '_blank');
        setIsOpen(false);
      },
      color: 'from-blue-600 to-blue-700'
    },
  ];

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: meetingTitle,
        text: 'Join my meeting on Nexus Meet',
        url: meetingLink,
      }).catch((error) => {
        console.log('Error sharing:', error);
      });
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          title="Share Meeting Link"
          className="cursor-pointer rounded-2xl bg-gradient-to-r from-orange-1/80 to-orange-2/80 backdrop-blur-md px-4 py-3 hover:from-orange-1 hover:to-orange-2 transition-all duration-300 border border-white/20 shadow-lg flex items-center gap-2"
        >
          <Share2 size={20} className="text-white" />
          <span className="text-white font-medium hidden sm:block">Share</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="border-white/20 bg-dark-1/95 backdrop-blur-md text-white rounded-xl mb-2 w-48 share-dropdown"
        align="center"
      >
        <div className="p-2">
          <div className="text-sm font-semibold text-white/90 mb-2 px-2">Share Meeting</div>
          
          {/* Native Share (mobile) */}
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <>
              <DropdownMenuItem
                onClick={handleNativeShare}
                className="hover:bg-white/10 rounded-lg cursor-pointer flex items-center gap-3 p-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-1 to-purple-2 flex items-center justify-center">
                  <Share2 size={16} className="text-white" />
                </div>
                <span>Share...</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="border-white/20 my-1" />
            </>
          )}

          {shareOptions.map((option, index) => (
            <DropdownMenuItem
              key={option.name}
              onClick={option.action}
              className="hover:bg-white/10 rounded-lg cursor-pointer flex items-center gap-3 p-3"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                <option.icon size={16} className="text-white" />
              </div>
              <span>{option.name}</span>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator className="border-white/20 my-1" />
          
          {/* Direct Link Display */}
          <div className="p-2">
            <div className="text-xs text-white/60 mb-1">Meeting Link:</div>
            <div className="text-xs text-white/80 bg-white/10 rounded p-2 break-all font-mono">
              {meetingLink}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
