'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useParams } from 'next/navigation';

import { useGetCallById } from '@/hooks/useGetCallById';
import Alert from '@/components/Alert';
import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';
import Loader from '@/components/Loader';

const MeetingPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const { isLoaded, user } = useUser();
  const { call, isCallLoading } = useGetCallById(id);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (!isLoaded || isCallLoading) return <Loader />;

  if (!call)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="mb-6 rounded-3xl border border-red-400/30 bg-gradient-to-br from-red-500/20 to-red-600/20 p-8">
            <div className="mb-4 text-6xl">❌</div>
            <h1 className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-3xl font-bold text-transparent">
              Meeting Not Found
            </h1>
          </div>
          <p className="mb-6 text-lg text-white/80">
            The meeting you&apos;re looking for doesn&apos;t exist or has ended.
          </p>
          <a
            href="/"
            className="inline-block rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 font-bold text-white transition-all duration-300 hover:from-blue-600 hover:to-purple-700"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );

  // get more info about custom call type:  https://getstream.io/video/docs/react/guides/configuring-call-types/
  const notAllowed =
    call.type === 'invited' &&
    (!user || !call.state.members.find((m) => m.user.id === user.id));

  if (notAllowed)
    return <Alert title="You are not allowed to join this meeting" />;

  return (
    <main className="h-screen w-full overflow-hidden">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingPage;
