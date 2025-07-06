'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCallStateHooks } from '@stream-io/video-react-sdk';
import {
  Mic,
  MicOff,
  Download,
  FileText,
  Clock,
  RotateCcw,
  Volume2,
  Headphones,
} from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { useSocket } from '@/providers/SocketProvider';
import { useParams } from 'next/navigation';
import jsPDF from 'jspdf';

interface TranscriptEntry {
  id: string;
  speaker: string;
  speakerId: string;
  text: string;
  timestamp: Date;
  confidence: number;
  isLocal: boolean;
  audioSource?: 'local' | 'remote' | 'mixed';
  meeting_id: string;
}

interface SpeechRecognitionEvent extends Event {
  results: any;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Enhanced audio capture class for remote streams
class RemoteAudioCapture {
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private recognition: any = null;
  private isActive = false;
  private onTranscript: (text: string, speakerId: string) => void;

  constructor(onTranscript: (text: string, speakerId: string) => void) {
    this.onTranscript = onTranscript;
  }

  async start(remoteStream?: MediaStream) {
    if (this.isActive) return;

    try {
      // Initialize Audio Context
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      let sourceNode;

      if (remoteStream) {
        // Use provided remote stream
        sourceNode = this.audioContext.createMediaStreamSource(remoteStream);
      } else {
        // Capture system audio (requires user permission)
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 16000,
          },
          video: false,
        });
        sourceNode = this.audioContext.createMediaStreamSource(displayStream);
      }

      // Create processor for audio analysis
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      // Create a destination stream for speech recognition
      const destination = this.audioContext.createMediaStreamDestination();

      sourceNode.connect(this.processor);
      this.processor.connect(destination);

      // Setup speech recognition on the processed audio
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              const transcript = event.results[i][0].transcript.trim();
              if (transcript) {
                this.onTranscript(transcript, 'remote-user');
              }
            }
          }
        };

        this.recognition.start();
      }

      this.isActive = true;
    } catch (error) {
      console.error('Failed to start remote audio capture:', error);
      throw error;
    }
  }

  stop() {
    if (!this.isActive) return;

    try {
      if (this.recognition) {
        this.recognition.stop();
        this.recognition = null;
      }

      if (this.processor) {
        this.processor.disconnect();
        this.processor = null;
      }

      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }

      this.isActive = false;
    } catch (error) {
      console.error('Error stopping remote audio capture:', error);
    }
  }

  get active() {
    return this.isActive;
  }
}

const TranscriptionPanel = () => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isListeningToAll, setIsListeningToAll] = useState(true);
  const [isCapturingRemoteAudio, setIsCapturingRemoteAudio] = useState(false);
  const [remoteAudioSupported, setRemoteAudioSupported] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const remoteAudioCaptureRef = useRef<RemoteAudioCapture | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const { socket, isConnected } = useSocket();
  const params = useParams();
  const meetingId = params?.id as string;

  // SSR safety check
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if remote audio capture is supported
  useEffect(() => {
    if (!isMounted) return;
    
    const checkSupport = () => {
      try {
        // Check if getDisplayMedia with audio is supported
        if (
          navigator.mediaDevices &&
          typeof navigator.mediaDevices.getDisplayMedia === 'function'
        ) {
          setRemoteAudioSupported(true);
        }
      } catch (error) {
        console.log('Remote audio capture not supported:', error);
        setRemoteAudioSupported(false);
      }
    };
    checkSupport();
  }, [isMounted]);

  // Listen for shared transcripts from other users
  useEffect(() => {
    if (!isMounted || !socket || !isConnected) return;

    socket.on('new-transcript', (transcript: TranscriptEntry) => {
      setTranscripts((prev) => {
        // Prevent duplicate transcripts
        if (prev.some((t) => t.id === transcript.id)) return prev;
        return [...prev, transcript];
      });
    });

    return () => {
      socket.off('new-transcript');
    };
  }, [isMounted, socket, isConnected]);

  // Get speaker name from participant ID
  const getSpeakerName = useCallback(
    (participantId: string) => {
      if (participantId === 'remote-user') return 'Remote Participant';
      if (participantId === 'mixed-audio') return 'Multiple Speakers';

      const participant = participants.find((p) => p.userId === participantId);
      return participant?.name || `User ${participantId.slice(-4)}`;
    },
    [participants]
  );

  // Handle remote audio transcript
  const handleRemoteTranscript = useCallback(
    (text: string, speakerId: string) => {
      if (!text.trim() || !socket || !isConnected || !meetingId) return;

      const transcript: Omit<TranscriptEntry, 'id' | 'timestamp'> & {
        meeting_id: string;
      } = {
        speaker: getSpeakerName(speakerId),
        speakerId,
        text: text.trim(),
        confidence: 0.8, // Estimated confidence for remote audio
        isLocal: false,
        audioSource: 'remote',
        meeting_id: meetingId,
      };

      // Share transcript with other participants
      if (isMounted && socket && isConnected) {
        socket.emit('send-transcript', transcript);
      }
    },
    [isMounted, socket, isConnected, meetingId, getSpeakerName]
  );

  // Setup enhanced remote audio capture
  const setupRemoteAudioCapture = useCallback(async () => {
    if (!remoteAudioSupported || !isListeningToAll) return;

    try {
      setIsCapturingRemoteAudio(true);

      // Initialize remote audio capture
      remoteAudioCaptureRef.current = new RemoteAudioCapture(
        handleRemoteTranscript
      );

      // Try to capture system audio for all participants
      await remoteAudioCaptureRef.current.start();

      toast({
        title: 'Enhanced Audio Capture',
        description: 'Now capturing audio from all participants',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to setup remote audio capture:', error);
      setIsCapturingRemoteAudio(false);

      toast({
        title: 'Audio Capture Limited',
        description:
          'Only local audio will be transcribed. Grant screen sharing permission for full capture.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [remoteAudioSupported, isListeningToAll, handleRemoteTranscript, toast]);

  // Start local transcription
  const startLocalTranscription = useCallback(async () => {
    if (!recognitionRef.current || !localParticipant) return;

    try {
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscript(interimTranscript);

        if (finalTranscript.trim() && socket && isConnected && meetingId) {
          const cleanTranscript = finalTranscript.trim();
          if (cleanTranscript.split(' ').length >= 2) {
            const transcript: Omit<TranscriptEntry, 'id' | 'timestamp'> & {
              meeting_id: string;
            } = {
              speaker: getSpeakerName(localParticipant.userId),
              speakerId: localParticipant.userId,
              text: cleanTranscript,
              confidence: event.results[event.resultIndex][0].confidence || 0.9,
              isLocal: true,
              audioSource: 'local',
              meeting_id: meetingId,
            };

            // Share transcript with other participants
            if (isMounted && socket && isConnected) {
              socket.emit('send-transcript', transcript);
            }
          }
          setCurrentTranscript('');
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast({
            title: 'Microphone Access Denied',
            description: 'Please allow microphone access to use transcription.',
            variant: 'destructive',
          });
        }
      };

      recognitionRef.current.onend = () => {
        if (isTranscribing) {
          setTimeout(() => {
            if (recognitionRef.current && isTranscribing) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error('Error restarting recognition:', error);
              }
            }
          }, 100);
        }
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting local transcription:', error);
      throw error;
    }
  }, [
    isMounted,
    recognitionRef,
    localParticipant,
    getSpeakerName,
    socket,
    isConnected,
    meetingId,
    isTranscribing,
    toast,
  ]);

  // Initialize speech recognition with better error handling
  useEffect(() => {
    // Capture ref values at the start of the effect
    const currentAudioStream = audioStreamRef.current;
    
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'en-US';
          recognitionRef.current.maxAlternatives = 3;
          
          // Add error handling
          recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsTranscribing(false);
            
            if (event.error === 'not-allowed') {
              toast({
                title: 'Microphone Permission Denied',
                description: 'Please allow microphone access and try again.',
                variant: 'destructive',
                duration: 5000,
              });
            } else if (event.error === 'no-speech') {
              // Restart recognition automatically
              setTimeout(() => {
                if (isTranscribing && recognitionRef.current) {
                  recognitionRef.current.start();
                }
              }, 1000);
            }
          };
          
          recognitionRef.current.onend = () => {
            // Auto-restart if still transcribing
            if (isTranscribing && recognitionRef.current) {
              setTimeout(() => {
                if (isTranscribing) {
                  recognitionRef.current.start();
                }
              }, 100);
            }
          };
          
          setSpeechRecognitionSupported(true);
        } catch (error) {
          console.error('Failed to initialize speech recognition:', error);
          setSpeechRecognitionSupported(false);
        }
      } else {
        setSpeechRecognitionSupported(false);
        toast({
          title: 'Speech Recognition Not Supported',
          description: 'Please use Chrome, Edge, or Safari for AI transcription.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (remoteAudioCaptureRef.current) {
        remoteAudioCaptureRef.current.stop();
      }
      if (currentAudioStream) {
        currentAudioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isTranscribing, toast]);

  const startTranscription = async () => {
    try {
      if (!recognitionRef.current) {
        toast({
          title: 'Speech Recognition Not Supported',
          description: 'Your browser does not support speech recognition.',
          variant: 'destructive',
        });
        return;
      }

      // Request microphone permission explicitly
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop immediately after getting permission
      } catch (error) {
        toast({
          title: 'Microphone Permission Required',
          description: 'Please allow microphone access to use AI transcription.',
          variant: 'destructive',
          duration: 5000,
        });
        return;
      }

      setIsTranscribing(true);

      // Start local transcription
      await startLocalTranscription();

      // Start remote audio capture if enabled
      if (isListeningToAll && remoteAudioSupported) {
        await setupRemoteAudioCapture();
      }

      toast({
        title: '🎤 AI Transcription Started',
        description: isListeningToAll
          ? `Recording all ${participants.length} participants`
          : 'Recording your voice only',
      });
    } catch (error) {
      console.error('Error starting transcription:', error);
      setIsTranscribing(false);
      toast({
        title: '❌ Transcription Error',
        description: 'Failed to start AI transcription',
        variant: 'destructive',
      });
    }
  };

  const stopTranscription = () => {
    setIsTranscribing(false);
    setCurrentTranscript('');

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (remoteAudioCaptureRef.current) {
      remoteAudioCaptureRef.current.stop();
      setIsCapturingRemoteAudio(false);
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    toast({
      title: '⏹️ Transcription Stopped',
      description: 'AI transcription has been stopped',
    });
  };

  const toggleAllParticipantsMode = () => {
    setIsListeningToAll(!isListeningToAll);
    toast({
      title: isListeningToAll ? '🎤 Personal Mode' : '🎧 Enhanced Mode',
      description: isListeningToAll
        ? 'Now recording your voice only'
        : 'Now attempting to record all participants',
    });
  };

  const resetTranscription = () => {
    setTranscripts([]);
    setCurrentTranscript('');
    toast({
      title: '🔄 Transcription Reset',
      description: 'All transcripts have been cleared',
    });
  };

  const generatePDF = async () => {
    if (transcripts.length === 0) {
      toast({
        title: '📄 No Content',
        description: 'No transcripts available to generate PDF',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingPDF(true);

    try {
      // eslint-disable-next-line new-cap
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Nexus Meet - AI Transcription Report', margin, yPosition);
      yPosition += 15;

      // Meeting info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 10;
      pdf.text(`Total Participants: ${participants.length}`, margin, yPosition);
      yPosition += 10;
      pdf.text(`Total Transcripts: ${transcripts.length}`, margin, yPosition);
      yPosition += 15;

      // Transcripts
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Transcript Details:', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      transcripts.forEach((transcript) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }

        // Speaker and timestamp
        const header = `[${transcript.timestamp.toLocaleTimeString()}] ${transcript.speaker} (${Math.round(transcript.confidence * 100)}%):`;
        pdf.setFont('helvetica', 'bold');
        pdf.text(header, margin, yPosition);
        yPosition += lineHeight;

        // Transcript text (wrapped)
        pdf.setFont('helvetica', 'normal');
        const textLines = pdf.splitTextToSize(
          transcript.text,
          pageWidth - margin * 2 - 10
        );
        textLines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin + 10, yPosition);
          yPosition += lineHeight;
        });
        yPosition += 3;
      });

      // Footer
      const totalPages = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text(
          `Page ${i} of ${totalPages} - Generated by Nexus Meet AI Transcription`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      const fileName = `nexus-meet-transcript-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: '📄 PDF Generated Successfully',
        description: `Transcript saved as ${fileName}`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: '❌ PDF Generation Failed',
        description: 'Failed to generate PDF transcript',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex h-full w-full flex-col border-l border-white/10 bg-gradient-to-br from-dark-1/95 to-dark-2/95 backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-purple-1 to-pink-1 p-2">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h3 className="bg-gradient-to-r from-purple-3 to-pink-3 bg-clip-text text-lg font-bold text-transparent">
              AI Transcription
            </h3>
            <p className="text-xs text-white/60">
              {isListeningToAll
                ? `Enhanced mode - ${participants.length} participants`
                : 'Personal mode'}
              {isCapturingRemoteAudio && (
                <span className="ml-2 text-blue-400">• Multi-audio</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">
            {transcripts.length} entries
          </span>
          {isTranscribing && (
            <div className="flex items-center gap-1">
              <div className="size-1 animate-pulse rounded-full bg-red-500"></div>
              <span className="text-xs text-red-400">Live</span>
            </div>
          )}
          {isCapturingRemoteAudio && (
            <div className="flex items-center gap-1">
              <Headphones size={12} className="text-blue-400" />
              <span className="text-xs text-blue-400">Enhanced</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="border-b border-white/10 p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            onClick={isTranscribing ? stopTranscription : startTranscription}
            disabled={!speechRecognitionSupported}
            size="sm"
            className={`flex items-center gap-2 ${
              !speechRecognitionSupported
                ? 'bg-gray-400 cursor-not-allowed'
                : isTranscribing
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            } rounded-xl font-semibold transition-all duration-300`}
          >
            {isTranscribing ? <MicOff size={16} /> : <Mic size={16} />}
            {isTranscribing ? 'Stop' : 'Start'}
          </Button>

          <Button
            onClick={toggleAllParticipantsMode}
            size="sm"
            className={`flex items-center gap-2 ${
              isListeningToAll
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
            } rounded-xl font-semibold transition-all duration-300`}
          >
            {isListeningToAll ? (
              <Headphones size={16} />
            ) : (
              <Volume2 size={16} />
            )}
            {isListeningToAll ? 'Enhanced' : 'Personal'}
          </Button>

          <Button
            onClick={resetTranscription}
            size="sm"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 font-semibold transition-all duration-300 hover:from-orange-600 hover:to-orange-700"
          >
            <RotateCcw size={16} />
            Reset
          </Button>

          <Button
            onClick={generatePDF}
            disabled={transcripts.length === 0 || isGeneratingPDF}
            size="sm"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 font-semibold transition-all duration-300 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50"
          >
            {isGeneratingPDF ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Download size={16} />
                PDF
              </>
            )}
          </Button>
        </div>

        {/* Statistics */}
        {transcripts.length > 0 && (
          <div className="mb-4 rounded-xl bg-gradient-to-br from-blue-1/20 to-purple-1/20 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">
                  {transcripts.length}
                </div>
                <div className="text-white/60">Total Messages</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">
                  {new Set(transcripts.map((t) => t.speakerId)).size}
                </div>
                <div className="text-white/60">Active Speakers</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transcription Content */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {transcripts.length === 0 && !isTranscribing ? (
          <div className="py-8 text-center">
            <div className="mb-4 rounded-xl bg-gradient-to-br from-blue-1/20 to-purple-1/20 p-6">
              <Mic size={32} className="mx-auto mb-2 text-blue-400" />
            </div>
            <p className="mb-4 text-sm text-white/60">
              Start AI transcription to capture and transcribe speech in
              real-time
            </p>
            <div className="space-y-2 text-xs text-white/40">
              <div className="flex items-center justify-center gap-2">
                <div className="size-2 rounded-full bg-green-400"></div>
                <span>Real-time speech recognition</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="size-2 rounded-full bg-blue-400"></div>
                <span>Multi-participant audio capture</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="size-2 rounded-full bg-teal-400"></div>
                <span>Enhanced remote audio processing</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="size-2 rounded-full bg-purple-400"></div>
                <span>Professional PDF export</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="size-2 rounded-full bg-pink-400"></div>
                <span>Confidence scoring & audio source tracking</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Active transcripts */}
            {transcripts.map((transcript) => (
              <div
                key={transcript.id}
                className={`rounded-xl p-3 transition-all duration-300 ${
                  transcript.isLocal
                    ? 'border border-blue-400/30 bg-gradient-to-r from-blue-500/20 to-purple-500/20'
                    : transcript.audioSource === 'mixed'
                      ? 'border border-green-400/30 bg-gradient-to-r from-green-500/20 to-teal-500/20'
                      : 'border border-gray-400/30 bg-gradient-to-r from-gray-500/20 to-slate-500/20'
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${
                      transcript.isLocal
                        ? 'text-blue-400'
                        : transcript.audioSource === 'mixed'
                          ? 'text-green-400'
                          : 'text-white'
                    }`}
                  >
                    {transcript.speaker}
                    {transcript.isLocal && (
                      <span className="ml-2 text-xs text-blue-300">(You)</span>
                    )}
                    {transcript.audioSource === 'mixed' && (
                      <span className="ml-2 text-xs text-green-300">
                        (Multi-audio)
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Clock size={12} />
                    <span>{formatTime(transcript.timestamp)}</span>
                    <span
                      className={`font-mono ${getConfidenceColor(transcript.confidence)}`}
                    >
                      {Math.round(transcript.confidence * 100)}%
                    </span>
                    {transcript.audioSource && (
                      <span className="rounded bg-white/10 px-1 py-0.5 text-xs">
                        {transcript.audioSource === 'local'
                          ? '🎤'
                          : transcript.audioSource === 'mixed'
                            ? '🎧'
                            : '📡'}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-white/90">
                  {transcript.text}
                </p>
              </div>
            ))}

            {/* Current live transcript */}
            {currentTranscript && isTranscribing && (
              <div className="rounded-xl border border-dashed border-blue-400/30 bg-blue-500/10 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-blue-400">
                    {getSpeakerName(localParticipant?.userId || '')}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="size-1 animate-pulse rounded-full bg-blue-400"></div>
                    <span className="text-xs text-blue-400">Speaking...</span>
                  </div>
                </div>
                <p className="text-sm italic text-white/70">
                  {currentTranscript}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionPanel;
