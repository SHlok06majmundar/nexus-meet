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
import { useRouter, useSearchParams } from 'next/navigation';
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
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
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
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      
      {/* Fixed Control Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-6">
        <div className="flex w-full items-center justify-center gap-3 px-4 meeting-controls">
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
            <div className="flex items-center">
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

          {/* End Call Button */}
          <EndCallButton />
        </div>
      </div>
    </section>
  );
};

export default MeetingRoom;
