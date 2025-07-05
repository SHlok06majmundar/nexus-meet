'use client';

import { useState, useEffect } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { Button } from './ui/button';
import { Circle, Square, Download, Loader2 } from 'lucide-react';
import { useToast } from './ui/use-toast';

const RecordingControls = () => {
  const call = useCall();
  const { useIsCallRecordingInProgress } = useCallStateHooks();
  const isRecording = useIsCallRecordingInProgress();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // Fetch recordings when component mounts and when recording stops
  useEffect(() => {
    if (call && !isRecording) {
      fetchRecordings();
    }
  }, [call, isRecording]);

  const fetchRecordings = async () => {
    if (!call) return;
    
    try {
      console.log('Fetching recordings for call:', call.id);
      const response = await call.queryRecordings();
      console.log('Recordings response:', response);
      
      const recordings = response.recordings || [];
      setRecordings(recordings);
      
      if (recordings.length > 0) {
        const latestRecording = recordings[recordings.length - 1];
        console.log('Latest recording:', latestRecording);
        
        if (latestRecording.url) {
          toast({
            title: '✅ Recording Ready!',
            description: 'Your recording is ready for download.',
          });
        } else {
          toast({
            title: '⏳ Recording Processing',
            description: 'Recording is still being processed. Please wait...',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching recordings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch recordings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const startRecording = async () => {
    if (!call) return;

    setIsLoading(true);
    try {
      // Start recording with Stream Video's default configuration
      // This will automatically record all participants' audio and video
      await call.startRecording();
      
      toast({
        title: '🔴 Recording Started',
        description: 'Meeting is now being recorded with audio and video from all participants',
      });
      
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording Failed',
        description: `Unable to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopRecording = async () => {
    if (!call) return;

    setIsLoading(true);
    try {
      await call.stopRecording();
      
      toast({
        title: '⏹️ Recording Stopped',
        description: 'Recording has been saved. Processing may take a few minutes...',
      });
      
      console.log('Recording stopped successfully');
      
      // Wait longer for the recording to be processed (Stream needs time)
      setTimeout(() => {
        fetchRecordings();
        toast({
          title: '🎬 Checking for Recording',
          description: 'Looking for your completed recording...',
        });
      }, 5000); // Wait 5 seconds
      
      // Check again after 15 seconds
      setTimeout(() => {
        fetchRecordings();
      }, 15000);
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast({
        title: 'Error Stopping Recording',
        description: `Failed to stop recording: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadRecording = async (recording: any) => {
    setIsDownloading(true);
    try {
      // Check if the recording URL is available
      if (!recording.url) {
        toast({
          title: 'Recording Not Ready',
          description: 'Recording is still being processed. Please wait a moment.',
          variant: 'destructive',
        });
        return;
      }

      // Create a proper download
      const filename = recording.filename || `nexus-meet-recording-${new Date().toISOString().split('T')[0]}.mp4`;
      
      try {
        // Try to download as blob first (for smaller files)
        const response = await fetch(recording.url, {
          method: 'GET',
          headers: {
            'Accept': 'video/mp4',
          },
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toast({
            title: '📥 Download Started',
            description: 'Recording is being downloaded to your device',
          });
        } else {
          throw new Error('Failed to fetch recording');
        }
      } catch (fetchError) {
        // Fallback: Open in new tab for download
        const link = document.createElement('a');
        link.href = recording.url;
        link.download = filename;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: '📥 Download Link Opened',
          description: 'Recording opened in new tab. Right-click and "Save As" to download.',
        });
      }
    } catch (error) {
      console.error('Error downloading recording:', error);
      toast({
        title: 'Download Failed',
        description: 'Unable to download recording. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const latestRecording = recordings[recordings.length - 1];

  return (
    <div className="flex items-center gap-2">
      {/* Recording Button */}
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isLoading}
        className={`
          rounded-2xl px-4 py-3 font-semibold transition-all duration-300 border shadow-lg hover:shadow-xl
          ${isRecording 
            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-red-400' 
            : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 border-gray-500'
          }
        `}
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
      >
        {isLoading ? (
          <Loader2 size={20} className="text-white animate-spin" />
        ) : isRecording ? (
          <Square size={20} className="text-white fill-white" />
        ) : (
          <Circle size={20} className="text-white" />
        )}
      </Button>

      {/* Download Button - Only show if there are recordings and not currently recording */}
      {latestRecording && !isRecording && (
        <Button
          onClick={() => downloadRecording(latestRecording)}
          disabled={isDownloading}
          className="rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-4 py-3 font-semibold transition-all duration-300 border border-green-400 shadow-lg hover:shadow-xl"
          title="Download Latest Recording"
        >
          {isDownloading ? (
            <Loader2 size={20} className="text-white animate-spin" />
          ) : (
            <Download size={20} className="text-white" />
          )}
        </Button>
      )}
    </div>
  );
};

export default RecordingControls;
