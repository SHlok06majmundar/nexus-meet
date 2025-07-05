'use client';
import { useState } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';
import { Users, LayoutList } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import ShareButton from './ShareButton';
import AdvancedRecordingControls from './AdvancedRecordingControls';
import TranscriptionPanel from './TranscriptionPanel';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();

  // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) return <Loader />;

  // Get the current meeting link
  const meetingLink = `${window.location.origin}/meeting/${call?.id}`;
  const meetingTitle = call?.state?.custom?.description || 'Nexus Meet Conference';

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden text-white bg-gradient-to-br from-dark-1 to-dark-2">
      <div className="relative flex size-full items-center justify-center pt-4">
        <div className={cn("flex size-full items-center transition-all duration-300", {
          "max-w-[calc(100%-320px)]": showTranscription,
          "max-w-[calc(100%-280px)]": showParticipants && !showTranscription,
          "max-w-[calc(100%-600px)]": showParticipants && showTranscription,
          "max-w-[1000px]": !showParticipants && !showTranscription
        })}>
          <CallLayout />
        </div>
        
        {/* Participants Panel */}
        <div
          className={cn('hidden h-[calc(100vh-86px)] transition-all duration-300', {
            'show-block w-[280px]': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>

        {/* AI Transcription Panel */}
        <div
          className={cn('transcription-panel hidden h-[calc(100vh-86px)] transition-all duration-300', {
            'show-block w-[320px]': showTranscription,
          })}
        >
          <TranscriptionPanel />
        </div>
      </div>
      
      {/* Fixed Control Bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-6">
        <div className="meeting-controls flex w-full items-center justify-center gap-3 px-4">
          {/* Main Call Controls */}
          <CallControls onLeave={() => router.push(`/`)} />

          {/* Recording Controls */}
          <AdvancedRecordingControls />

          {/* Share Meeting Button */}
          <ShareButton 
            meetingLink={meetingLink}
            meetingTitle={meetingTitle}
          />

          {/* Layout Control */}
          <DropdownMenu>
            <div className="layout-control flex items-center">
              <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-gradient-to-r from-blue-1/80 to-purple-1/80 backdrop-blur-md px-4 py-3 hover:from-blue-1 hover:to-purple-1 transition-all duration-300 border border-white/20 shadow-lg">
                <LayoutList size={20} className="text-white" />
              </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent className="border-white/20 bg-dark-1/90 backdrop-blur-md text-white rounded-xl mb-2">
              {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
                <div key={index}>
                  <DropdownMenuItem
                    onClick={() =>
                      setLayout(item.toLowerCase() as CallLayoutType)
                    }
                    className="hover:bg-white/10 rounded-lg cursor-pointer"
                  >
                    {item}
                  </DropdownMenuItem>
                  {index < 2 && <DropdownMenuSeparator className="border-white/20" />}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Participants Toggle */}
          <button 
            onClick={() => setShowParticipants((prev) => !prev)}
            title="Toggle Participants"
            className="cursor-pointer rounded-2xl bg-gradient-to-r from-green-1/80 to-green-2/80 backdrop-blur-md px-4 py-3 hover:from-green-1 hover:to-green-2 transition-all duration-300 border border-white/20 shadow-lg"
          >
            <Users size={20} className="text-white" />
          </button>

          {/* AI Transcription Toggle */}
          <button 
            onClick={() => setShowTranscription((prev) => !prev)}
            title="Toggle AI Transcription"
            className={cn(
              "cursor-pointer rounded-2xl backdrop-blur-md px-4 py-3 transition-all duration-300 border border-white/20 shadow-lg",
              showTranscription 
                ? "bg-gradient-to-r from-purple-1 to-pink-1 hover:from-purple-2 hover:to-pink-2" 
                : "bg-gradient-to-r from-purple-1/80 to-pink-1/80 hover:from-purple-1 hover:to-pink-1"
            )}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M7 8C7 5.79086 8.79086 4 11 4H13C15.2091 4 17 5.79086 17 8V12C17 14.2091 15.2091 16 13 16H11C8.79086 16 7 14.2091 7 12V8Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16V20M12 20H8M12 20H16" stroke="currentColor" strokeWidth="2"/>
              <path d="M19 10V12C19 16.4183 15.4183 20 11 20" stroke="currentColor" strokeWidth="2"/>
              <path d="M5 10V12C5 16.4183 8.58172 20 13 20" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>

          {/* End Call Button */}
          <EndCallButton />
        </div>
      </div>
    </section>
  );
};

export default MeetingRoom;
