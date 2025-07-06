'use client';

import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';

import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();

  if (!call)
    throw new Error(
      'useStreamCall must be used within a StreamCall component.'
    );

  // https://getstream.io/video/docs/react/guides/call-and-participant-state/#participant-state-3
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) return null;

  const endCall = async () => {
    await call.endCall();
    router.push('/');
  };

  return (
    <Button
      onClick={endCall}
      className="rounded-xl border border-red-400 bg-gradient-to-r from-red-500 to-red-600 px-3 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-xl sm:rounded-2xl sm:px-6 sm:py-3 sm:text-base"
    >
      <span className="flex items-center gap-1 sm:gap-2">
        <span className="text-sm sm:text-base">📞</span>
        <span className="hidden sm:inline">End call for everyone</span>
        <span className="sm:hidden">End</span>
      </span>
    </Button>
  );
};

export default EndCallButton;
