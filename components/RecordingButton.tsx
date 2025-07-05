'use client';

import { useState, useEffect } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { Button } from './ui/button';
import { Download, Circle, Square } from 'lucide-react';
import { useToast } from './ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const RecordingButton = () => {
  const call = useCall();
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<any[]>([]);
  const { useIsCallRecordingInProgress } = useCallStateHooks();
  const isCallRecordingInProgress = useIsCallRecordingInProgress();

  if (!call) return null;

  // Fetch recordings on component mount
  useEffect(() => {
    fetchRecordings();
  }, []);

  const startRecording = async () => {
    try {
      await call.startRecording();
      toast({
        title: 'Recording Started',
        description: 'The meeting is now being recorded.',
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: 'Recording Failed',
        description: 'Failed to start recording. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = async () => {
    try {
      await call.stopRecording();
      toast({
        title: 'Recording Stopped',
        description: 'The recording has been saved and will be available for download shortly.',
      });
      // Fetch recordings after stopping with a delay
      setTimeout(fetchRecordings, 3000);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      toast({
        title: 'Failed to Stop Recording',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const fetchRecordings = async () => {
    try {
      const response = await call.queryRecordings();
      setRecordings(response.recordings || []);
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
    }
  };

  const downloadRecording = async (recording: any) => {
    try {
      toast({
        title: 'Download Starting',
        description: 'Preparing your recording for download...',
      });

      // Create a temporary anchor element for download
      const a = document.createElement('a');
      a.href = recording.url;
      a.download = recording.filename || `nexus-meet-recording-${new Date().toISOString().slice(0, 10)}.mp4`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: 'Download Started',
        description: 'Your recording download has been initiated.',
      });
    } catch (error) {
      console.error('Failed to download recording:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download the recording. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Recording Control Button */}
      <Button
        onClick={isCallRecordingInProgress ? stopRecording : startRecording}
        className={`rounded-2xl px-4 py-3 transition-all duration-300 border border-white/20 shadow-lg ${
          isCallRecordingInProgress
            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse'
            : 'bg-gradient-to-r from-gray-600/80 to-gray-700/80 hover:from-red-500 hover:to-red-600'
        }`}
        title={isCallRecordingInProgress ? 'Stop Recording' : 'Start Recording'}
      >
        {isCallRecordingInProgress ? (
          <Square size={20} className="text-white" />
        ) : (
          <Circle size={20} className="text-white fill-current" />
        )}
      </Button>

      {/* Download Recordings Dropdown */}
      {recordings.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="rounded-2xl bg-gradient-to-r from-green-500/80 to-green-600/80 hover:from-green-600 hover:to-green-700 px-4 py-3 transition-all duration-300 border border-white/20 shadow-lg"
              title={`Download Recordings (${recordings.length} available)`}
            >
              <Download size={20} className="text-white" />
              {recordings.length > 0 && (
                <span className="ml-1 text-xs bg-white/20 rounded-full px-1.5 py-0.5">
                  {recordings.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-white/20 bg-dark-1/90 backdrop-blur-md text-white rounded-xl mb-2 min-w-[250px]">
            <div className="px-2 py-1 text-sm font-semibold text-white/80">
              Available Recordings ({recordings.length})
            </div>
            <DropdownMenuSeparator className="border-white/20" />
            {recordings.map((recording, index) => (
              <DropdownMenuItem
                key={recording.url}
                onClick={() => downloadRecording(recording)}
                className="hover:bg-white/10 rounded-lg cursor-pointer flex items-center gap-2"
              >
                <Download size={16} className="text-green-400" />
                <div className="flex flex-col">
                  <span className="text-sm">
                    Recording {index + 1}
                  </span>
                  <span className="text-xs text-white/60">
                    {new Date(recording.start_time).toLocaleString()}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="border-white/20" />
            <div className="px-2 py-1 text-xs text-white/60">
              Click any recording to download
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default RecordingButton;
