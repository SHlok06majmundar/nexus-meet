'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { Button } from './ui/button';
import { Circle, Square, Download, Loader2 } from 'lucide-react';
import { useToast } from './ui/use-toast';

const LocalRecordingControls = () => {
  const call = useCall();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const { toast } = useToast();

  // Local recording states
  const [isLocalRecording, setIsLocalRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for canvas composition
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mixedAudioRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const compositeStreamRef = useRef<MediaStream | null>(null);

  // Create composite video stream from all participants
  const createCompositeStream = useCallback(async () => {
    if (!canvasRef.current || participants.length === 0) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size
    canvas.width = 1920;
    canvas.height = 1080;

    // Create audio context for mixing audio
    audioContextRef.current = new AudioContext();
    mixedAudioRef.current =
      audioContextRef.current.createMediaStreamDestination();

    // Get video streams from all participants
    const videoElements: HTMLVideoElement[] = [];
    const audioSources: MediaStreamAudioSourceNode[] = [];

    // Process each participant
    for (const participant of participants) {
      try {
        // Get participant's video stream
        if (participant.videoStream) {
          const video = document.createElement('video');
          video.srcObject = participant.videoStream;
          video.autoplay = true;
          video.muted = true;
          await new Promise((resolve) => {
            video.onloadedmetadata = resolve;
          });
          videoElements.push(video);
        }

        // Get participant's audio stream for mixing
        if (
          participant.audioStream &&
          audioContextRef.current &&
          mixedAudioRef.current
        ) {
          const audioSource = audioContextRef.current.createMediaStreamSource(
            participant.audioStream
          );
          audioSource.connect(mixedAudioRef.current);
          audioSources.push(audioSource);
        }
      } catch (error) {
        console.error('Error processing participant stream:', error);
      }
    }

    // Function to draw composite video
    const drawComposite = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate grid layout based on participant count
      const participantCount = videoElements.length;
      let cols = Math.ceil(Math.sqrt(participantCount));
      let rows = Math.ceil(participantCount / cols);

      if (participantCount === 1) {
        cols = 1;
        rows = 1;
      } else if (participantCount === 2) {
        cols = 2;
        rows = 1;
      }

      const cellWidth = canvas.width / cols;
      const cellHeight = canvas.height / rows;

      // Draw each participant video
      videoElements.forEach((video, index) => {
        if (video.readyState >= 2) {
          // HAVE_CURRENT_DATA
          const col = index % cols;
          const row = Math.floor(index / cols);

          const x = col * cellWidth;
          const y = row * cellHeight;

          // Maintain aspect ratio
          const videoAspect = video.videoWidth / video.videoHeight;
          const cellAspect = cellWidth / cellHeight;

          let drawWidth = cellWidth;
          let drawHeight = cellHeight;
          let offsetX = 0;
          let offsetY = 0;

          if (videoAspect > cellAspect) {
            drawHeight = cellWidth / videoAspect;
            offsetY = (cellHeight - drawHeight) / 2;
          } else {
            drawWidth = cellHeight * videoAspect;
            offsetX = (cellWidth - drawWidth) / 2;
          }

          ctx.drawImage(video, x + offsetX, y + offsetY, drawWidth, drawHeight);

          // Draw participant name
          const participantName =
            participants[index]?.name ||
            participants[index]?.userId ||
            'Unknown';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(x + 10, y + cellHeight - 40, 200, 30);
          ctx.fillStyle = '#ffffff';
          ctx.font = '16px Inter, sans-serif';
          ctx.fillText(participantName, x + 15, y + cellHeight - 20);
        }
      });
    };

    // Start drawing loop
    const drawInterval = setInterval(drawComposite, 1000 / 30); // 30 FPS

    // Create final composite stream
    const canvasStream = canvas.captureStream(30);
    const videoTrack = canvasStream.getVideoTracks()[0];

    // Combine video and mixed audio
    const compositeStream = new MediaStream([videoTrack]);
    if (mixedAudioRef.current) {
      const audioTrack = mixedAudioRef.current.stream.getAudioTracks()[0];
      if (audioTrack) {
        compositeStream.addTrack(audioTrack);
      }
    }

    // Store references for cleanup
    compositeStreamRef.current = compositeStream;

    // Store cleanup function
    (compositeStream as any).cleanup = () => {
      clearInterval(drawInterval);
      videoElements.forEach((video) => {
        video.pause();
        video.srcObject = null;
      });
      audioSources.forEach((source) => source.disconnect());
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };

    return compositeStream;
  }, [participants]);

  const startLocalRecording = async () => {
    try {
      setIsLoading(true);

      // Create composite stream
      const stream = await createCompositeStream();
      if (!stream) {
        throw new Error('Failed to create composite stream');
      }

      // Create MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus',
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedChunks([blob]);

        // Cleanup
        if (
          compositeStreamRef.current &&
          (compositeStreamRef.current as any).cleanup
        ) {
          (compositeStreamRef.current as any).cleanup();
        }

        toast({
          title: '✅ Recording Complete!',
          description: 'Your local recording is ready for download.',
        });
      };

      recorder.onerror = (event) => {
        console.error('Recording error:', event);
        toast({
          title: '❌ Recording Error',
          description: 'Failed to record the meeting.',
        });
      };

      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setIsLocalRecording(true);

      toast({
        title: '🔴 Recording Started',
        description:
          'Local recording has started with audio and video from all participants.',
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: '❌ Recording Failed',
        description: 'Could not start recording. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopLocalRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsLocalRecording(false);

      toast({
        title: '⏹️ Recording Stopped',
        description: 'Processing your recording...',
      });
    }
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) return;

    const blob = recordedChunks[0];
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-meet-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: '💾 Download Started',
      description: 'Your recording is being downloaded.',
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      if (
        compositeStreamRef.current &&
        (compositeStreamRef.current as any).cleanup
      ) {
        (compositeStreamRef.current as any).cleanup();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [mediaRecorder]);

  if (!call) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Hidden canvas for video composition */}
      <canvas ref={canvasRef} className="hidden" width={1920} height={1080} />

      {/* Recording Button */}
      {!isLocalRecording ? (
        <Button
          onClick={startLocalRecording}
          disabled={isLoading || participants.length === 0}
          className="rounded-2xl border border-red-400 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-xl"
          title="Start Local Recording"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Circle size={20} className="text-white" />
          )}
        </Button>
      ) : (
        <Button
          onClick={stopLocalRecording}
          className="animate-pulse rounded-2xl border border-red-500 bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-red-700 hover:to-red-800 hover:shadow-xl"
          title="Stop Recording"
        >
          <Square size={20} className="text-white" />
        </Button>
      )}

      {/* Download Button */}
      {recordedChunks.length > 0 && (
        <Button
          onClick={downloadRecording}
          className="rounded-2xl border border-green-400 bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:shadow-xl"
          title="Download Recording"
        >
          <Download size={20} className="text-white" />
        </Button>
      )}
    </div>
  );
};

export default LocalRecordingControls;
