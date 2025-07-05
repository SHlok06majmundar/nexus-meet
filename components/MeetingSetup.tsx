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
      'useStreamCall must be used within a StreamCall component.',
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
    <div className="flex h-screen w-full flex-col items-center justify-center gap-8 text-white bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-6">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Ready to Join?
          </h1>
          <p className="text-xl text-white/80">Set up your camera and microphone before joining the meeting</p>
        </div>

        {/* Video Preview Container */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-br from-dark-1/80 to-dark-2/80 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="relative overflow-hidden rounded-2xl bg-dark-3/50 min-h-[400px] flex items-center justify-center">
              <VideoPreview />
              <div className="absolute top-4 left-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Camera Preview
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-gradient-to-br from-dark-1/80 to-dark-2/80 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
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
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                    isMicCamToggled
                      ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-400/50'
                      : 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-400/50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isMicCamToggled
                      ? 'border-red-400 bg-red-500'
                      : 'border-green-400 bg-transparent'
                  }`}>
                    {isMicCamToggled && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-lg font-semibold text-white">
                    {isMicCamToggled ? '🔇 Join with mic and camera off' : '🎤 Join with mic and camera on'}
                  </span>
                </label>
              </div>
            </div>

            {/* Device Settings */}
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/50 rounded-2xl p-1">
                <DeviceSettings />
              </div>
            </div>
          </div>

          {/* Join Button */}
          <div className="mt-8 text-center">
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-2xl text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-blue-400/50"
              onClick={() => {
                call.join();
                setIsSetupComplete(true);
              }}
            >
              <span className="flex items-center gap-3">
                🚀 Join Meeting Now
              </span>
            </Button>
            <p className="text-white/60 mt-4 text-sm">
              Click to join the meeting with your current settings
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/30 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">🎥</div>
            <h3 className="font-semibold text-white mb-1">HD Video</h3>
            <p className="text-white/70 text-sm">Crystal clear video quality</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-400/30 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-white mb-1">Secure</h3>
            <p className="text-white/70 text-sm">End-to-end encryption</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-400/30 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-white mb-1">Fast</h3>
            <p className="text-white/70 text-sm">Low latency connection</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingSetup;
