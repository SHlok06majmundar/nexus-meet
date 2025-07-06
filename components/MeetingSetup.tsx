'use client';
import { useEffect, useState } from 'react';
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';

import Alert from './Alert';
import { Button } from './ui/button';

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  // https://getstream.io/video/docs/react/guides/call-and-participant-state/#call-state
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();

  if (!call) {
    throw new Error(
      'useStreamCall must be used within a StreamCall component.'
    );
  }

  // https://getstream.io/video/docs/react/ui-cookbook/replacing-call-controls/
  const [isMicCamToggled, setIsMicCamToggled] = useState(false);

  useEffect(() => {
    if (isMicCamToggled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [isMicCamToggled, call.camera, call.microphone]);

  if (callTimeNotArrived)
    return (
      <Alert
        title={`Your Meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}`}
      />
    );

  if (callHasEnded)
    return (
      <Alert
        title="The call has been ended by the host"
        iconUrl="/icons/call-ended.svg"
      />
    );

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-8 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-6 text-white">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Ready to Join?
          </h1>
          <p className="text-xl text-white/80">
            Set up your camera and microphone before joining the meeting
          </p>
        </div>

        {/* Video Preview Container */}
        <div className="relative mb-8">
          <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-dark-1/80 to-dark-2/80 p-6 shadow-2xl backdrop-blur-lg">
            <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-2xl bg-dark-3/50">
              <VideoPreview />
              <div className="absolute left-4 top-4">
                <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-semibold">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
                  Camera Preview
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-dark-1/80 to-dark-2/80 p-8 shadow-2xl backdrop-blur-lg">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            {/* Mic/Camera Toggle */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="checkbox"
                  id="micCamToggle"
                  checked={isMicCamToggled}
                  onChange={(e) => setIsMicCamToggled(e.target.checked)}
                  className="sr-only"
                />
                <label
                  htmlFor="micCamToggle"
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-6 py-4 transition-all duration-300 ${
                    isMicCamToggled
                      ? 'border-red-400/50 bg-gradient-to-r from-red-500/20 to-red-600/20'
                      : 'border-green-400/50 bg-gradient-to-r from-green-500/20 to-green-600/20'
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isMicCamToggled
                        ? 'border-red-400 bg-red-500'
                        : 'border-green-400 bg-transparent'
                    }`}
                  >
                    {isMicCamToggled && (
                      <div className="h-3 w-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-lg font-semibold text-white">
                    {isMicCamToggled
                      ? '🔇 Join with mic and camera off'
                      : '🎤 Join with mic and camera on'}
                  </span>
                </label>
              </div>
            </div>

            {/* Device Settings */}
            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-blue-400/50 bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-1">
                <DeviceSettings />
              </div>
            </div>
          </div>

          {/* Join Button */}
          <div className="mt-8 text-center">
            <Button
              className="transform rounded-2xl border border-blue-400/50 bg-gradient-to-r from-blue-500 to-purple-600 px-12 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-purple-700 hover:shadow-2xl"
              onClick={() => {
                call.join();
                setIsSetupComplete(true);
              }}
            >
              <span className="flex items-center gap-3">
                🚀 Join Meeting Now
              </span>
            </Button>
            <p className="mt-4 text-sm text-white/60">
              Click to join the meeting with your current settings
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 text-center">
            <div className="mb-2 text-2xl">🎥</div>
            <h3 className="mb-1 font-semibold text-white">HD Video</h3>
            <p className="text-sm text-white/70">Crystal clear video quality</p>
          </div>
          <div className="rounded-2xl border border-green-400/30 bg-gradient-to-br from-green-500/20 to-green-600/20 p-4 text-center">
            <div className="mb-2 text-2xl">🔒</div>
            <h3 className="mb-1 font-semibold text-white">Secure</h3>
            <p className="text-sm text-white/70">End-to-end encryption</p>
          </div>
          <div className="rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-4 text-center">
            <div className="mb-2 text-2xl">⚡</div>
            <h3 className="mb-1 font-semibold text-white">Fast</h3>
            <p className="text-sm text-white/70">Low latency connection</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingSetup;
