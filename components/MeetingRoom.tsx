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
import { Users, LayoutList, MessageSquare, FileText } from 'lucide-react';

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
import LocalRecordingControls from './LocalRecordingControls';
import ChatPanel from './ChatPanel';
import TranscriptionPanel from './TranscriptionPanel';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
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
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-dark-1 to-dark-2 text-white">
      <div className="flex h-full">
        {/* Main Video Area */}
        <div className="flex flex-1 flex-col">
          <div className="relative flex size-full items-center justify-center pt-4">
            <div className="flex size-full max-w-[1000px] items-center">
              <CallLayout />
            </div>
          </div>
          
          {/* Fixed Control Bar */}
          <div className="inset-x-0 bottom-0 z-50 bg-gradient-to-t from-black/80 to-transparent pb-6 pt-8">
            <div className="meeting-controls flex w-full items-center justify-center gap-3 px-4">
              {/* Main Call Controls */}
              <CallControls onLeave={() => router.push(`/`)} />

              {/* Recording Controls */}
              <LocalRecordingControls />

              {/* Share Meeting Button */}
              <ShareButton 
                meetingLink={meetingLink}
                meetingTitle={meetingTitle}
              />

              {/* Chat Toggle */}
              <button 
                onClick={() => setShowChat((prev) => !prev)}
                title="Toggle Chat"
                className={cn(
                  "cursor-pointer rounded-2xl backdrop-blur-md px-4 py-3 transition-all duration-300 border border-white/20 shadow-lg",
                  showChat 
                    ? "bg-gradient-to-r from-purple-1 to-pink-1" 
                    : "bg-gradient-to-r from-purple-1/80 to-pink-1/80 hover:from-purple-1 hover:to-pink-1"
                )}
              >
                <MessageSquare size={20} className="text-white" />
              </button>

              {/* AI Transcription Toggle */}
              <button 
                onClick={() => setShowTranscription((prev) => !prev)}
                title="Toggle AI Transcription"
                className={cn(
                  "cursor-pointer rounded-2xl backdrop-blur-md px-4 py-3 transition-all duration-300 border border-white/20 shadow-lg",
                  showTranscription 
                    ? "bg-gradient-to-r from-orange-1 to-red-1" 
                    : "bg-gradient-to-r from-orange-1/80 to-red-1/80 hover:from-orange-1 hover:to-red-1"
                )}
              >
                <FileText size={20} className="text-white" />
              </button>

              {/* Layout Control */}
              <DropdownMenu>
                <div className="flex items-center">
                  <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-gradient-to-r from-blue-1/80 to-purple-1/80 px-4 py-3 backdrop-blur-md transition-all duration-300 hover:from-blue-1 hover:to-purple-1 border border-white/20 shadow-lg">
                    <LayoutList size={20} className="text-white" />
                  </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent className="mb-2 rounded-xl border-white/20 bg-dark-1/90 text-white backdrop-blur-md">
                  {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
                    <div key={index}>
                      <DropdownMenuItem
                        onClick={() =>
                          setLayout(item.toLowerCase() as CallLayoutType)
                        }
                        className="cursor-pointer rounded-lg hover:bg-white/10"
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
                className={cn(
                  "cursor-pointer rounded-2xl backdrop-blur-md px-4 py-3 transition-all duration-300 border border-white/20 shadow-lg",
                  showParticipants 
                    ? "bg-gradient-to-r from-green-1 to-green-2" 
                    : "bg-gradient-to-r from-green-1/80 to-green-2/80 hover:from-green-1 hover:to-green-2"
                )}
              >
                <Users size={20} className="text-white" />
              </button>

              {/* End Call Button */}
              <EndCallButton />
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="flex">
          {/* Mobile overlay for panels */}
          {(showParticipants || showChat || showTranscription) && (
            <div 
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => {
                setShowParticipants(false);
                setShowChat(false);
                setShowTranscription(false);
              }}
            />
          )}
          
          {/* Participants Panel */}
          {showParticipants && (
            <div className="fixed right-0 top-0 z-50 h-full w-80 border-l border-white/10 bg-dark-1/95 backdrop-blur-md md:relative md:w-80">
              <CallParticipantsList onClose={() => setShowParticipants(false)} />
            </div>
          )}
          
          {/* Chat Panel */}
          {showChat && (
            <div className="fixed right-0 top-0 z-50 h-full w-80 border-l border-white/10 bg-dark-1/95 backdrop-blur-md md:relative md:w-80">
              <ChatPanel />
            </div>
          )}
          
          {/* AI Transcription Panel */}
          {showTranscription && (
            <div className="fixed right-0 top-0 z-50 h-full w-80 border-l border-white/10 bg-dark-1/95 backdrop-blur-md md:relative md:w-80">
              <TranscriptionPanel />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MeetingRoom;
