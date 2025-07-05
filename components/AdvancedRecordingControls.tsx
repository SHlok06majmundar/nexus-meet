'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { Circle, Square, Download, Video, Loader2, VolumeX, RotateCcw } from 'lucide-react';

const AdvancedRecordingControls = () => {
  const call = useCall();
  const { useIsCallRecordingInProgress } = useCallStateHooks();
  const isStreamRecording = useIsCallRecordingInProgress();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLocalRecording, setIsLocalRecording] = useState(false);
  const [localRecordingUrl, setLocalRecordingUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Fetch recordings on mount and when recording stops
  useEffect(() => {
    if (!isStreamRecording && call) {
      fetchRecordings();
    }
  }, [isStreamRecording, call]);

  const fetchRecordings = async () => {
    if (!call) return;
    
    try {
      const response = await call.queryRecordings();
      setRecordings(response.recordings || []);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to fetch recordings',
        variant: 'destructive',
      });
    }
  };

  const startStreamRecording = async () => {
    if (!call) return;

    setIsLoading(true);
    try {
      await call.startRecording();
      
      toast({
        title: '🔴 Recording Started',
        description: 'Meeting is now being recorded',
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to start recording',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startLocalRecording = async () => {
    try {
      // Get the entire screen with audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Try to get audio from microphone as well
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          }
        });

        // Combine video and audio tracks
        const combinedStream = new MediaStream([
          ...stream.getVideoTracks(),
          ...stream.getAudioTracks(),
          ...audioStream.getAudioTracks()
        ]);

        setupRecording(combinedStream);
      } catch (audioError) {
        console.warn('Could not get microphone audio, using screen audio only:', audioError);
        setupRecording(stream);
      }

    } catch (error) {
      console.error('Error starting local recording:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to start local recording. Please ensure you grant screen sharing permissions.',
        variant: 'destructive',
      });
    }
  };

  const setupRecording = (stream: MediaStream) => {
    chunksRef.current = [];
    
    const options = {
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: 2500000,
      audioBitsPerSecond: 128000
    };

    // Fallback to vp8 if vp9 is not supported
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm;codecs=vp8,opus';
    }

    // Fallback to basic webm if codecs are not supported
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm';
    }

    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setLocalRecordingUrl(url);
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: '✅ Local Recording Complete',
        description: 'Recording saved and ready for download',
      });
    };

    mediaRecorder.start(1000); // Collect data every second
    setIsLocalRecording(true);

    toast({
      title: '🔴 Local Recording Started',
      description: 'Recording your screen with audio',
    });
  };

  const stopRecording = async () => {
    setIsLoading(true);
    
    try {
      if (isStreamRecording && call) {
        await call.stopRecording();
        toast({
          title: '⏹️ Stream Recording Stopped',
          description: 'Processing recording...',
        });
      }
      
      if (isLocalRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsLocalRecording(false);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to stop recording',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadStreamRecording = async (recording: any) => {
    setIsDownloading(true);
    try {
      const response = await fetch(recording.url);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const filename = `nexus-meet-${recording.filename || new Date().toISOString().split('T')[0]}.mp4`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: '📥 Recording Downloaded',
        description: 'Stream recording saved to your device',
      });
    } catch (error) {
      console.error('Error downloading recording:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to download recording',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadLocalRecording = () => {
    if (!localRecordingUrl) return;

    const filename = `nexus-meet-local-${new Date().toISOString().split('T')[0]}.webm`;
    const link = document.createElement('a');
    link.href = localRecordingUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: '📥 Local Recording Downloaded',
      description: 'Local recording saved to your device',
    });
  };

  const resetRecordings = () => {
    // Clear local recording URL
    if (localRecordingUrl) {
      URL.revokeObjectURL(localRecordingUrl);
      setLocalRecordingUrl(null);
    }
    
    // Clear recordings array to hide download buttons
    setRecordings([]);
    
    // Reset chunks
    chunksRef.current = [];
    
    // Clear any media recorder reference
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }

    toast({
      title: '🔄 Reset Complete',
      description: 'Ready for new recording session',
    });
  };

  const isRecording = isStreamRecording || isLocalRecording;
  const latestStreamRecording = recordings[recordings.length - 1];
  const hasRecordings = latestStreamRecording || localRecordingUrl;

  return (
    <div className="flex items-center gap-2 max-sm:gap-1 flex-wrap">
      {/* Main Recording Button */}
      <Button
        onClick={isRecording ? stopRecording : startStreamRecording}
        disabled={isLoading}
        className={`
          rounded-2xl px-4 py-3 max-sm:px-3 max-sm:py-2 font-semibold transition-all duration-300 border shadow-lg hover:shadow-xl
          ${isRecording
            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-red-400'
            : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 border-gray-500'
          }
        `}
        title={isRecording ? 'Stop Recording' : 'Start Stream Recording'}
      >
        {isLoading ? (
          <Loader2 size={20} className="text-white animate-spin max-sm:w-4 max-sm:h-4" />
        ) : isRecording ? (
          <Square size={20} className="text-white fill-white max-sm:w-4 max-sm:h-4" />
        ) : (
          <Circle size={20} className="text-white max-sm:w-4 max-sm:h-4" />
        )}
      </Button>

      {/* Local Recording Button */}
      {!isRecording && (
        <Button
          onClick={startLocalRecording}
          className="rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 px-4 py-3 max-sm:px-3 max-sm:py-2 font-semibold transition-all duration-300 border border-purple-400 shadow-lg hover:shadow-xl"
          title="Start Local Screen Recording"
        >
          <VolumeX size={20} className="text-white max-sm:w-4 max-sm:h-4" />
        </Button>
      )}

      {/* Download Stream Recording */}
      {latestStreamRecording && !isRecording && (
        <Button
          onClick={() => downloadStreamRecording(latestStreamRecording)}
          disabled={isDownloading}
          className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-3 max-sm:px-3 max-sm:py-2 font-semibold transition-all duration-300 border border-blue-400 shadow-lg hover:shadow-xl"
          title="Download Stream Recording"
        >
          {isDownloading ? (
            <Loader2 size={20} className="text-white animate-spin max-sm:w-4 max-sm:h-4" />
          ) : (
            <Video size={20} className="text-white max-sm:w-4 max-sm:h-4" />
          )}
        </Button>
      )}

      {/* Download Local Recording */}
      {localRecordingUrl && !isLocalRecording && (
        <Button
          onClick={downloadLocalRecording}
          className="rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-4 py-3 max-sm:px-3 max-sm:py-2 font-semibold transition-all duration-300 border border-green-400 shadow-lg hover:shadow-xl"
          title="Download Local Recording"
        >
          <Download size={20} className="text-white max-sm:w-4 max-sm:h-4" />
        </Button>
      )}

      {/* Reset Button - Only show when there are recordings and not currently recording */}
      {hasRecordings && !isRecording && (
        <Button
          onClick={resetRecordings}
          className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-4 py-3 max-sm:px-3 max-sm:py-2 font-semibold transition-all duration-300 border border-orange-400 shadow-lg hover:shadow-xl"
          title="Reset for New Recording"
        >
          <RotateCcw size={20} className="text-white max-sm:w-4 max-sm:h-4" />
        </Button>
      )}

      {/* Recording Status Indicator */}
      {isRecording && (
        <div className="flex items-center gap-1 px-3 py-2 max-sm:px-2 max-sm:py-1 bg-red-500/20 rounded-xl border border-red-400/30">
          <div className="w-2 h-2 max-sm:w-1.5 max-sm:h-1.5 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs max-sm:text-[10px] text-white/80 font-medium">
            {isStreamRecording ? 'Stream REC' : 'Local REC'}
          </span>
        </div>
      )}
    </div>
  );
};

export default AdvancedRecordingControls;
