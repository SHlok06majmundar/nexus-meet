'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { Mic, MicOff, Download, FileText, Clock, RotateCcw, Volume2, Headphones } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
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
}

interface SpeechRecognitionEvent extends Event {
  results: any;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

const TranscriptionPanel = () => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isListeningToAll, setIsListeningToAll] = useState(true);
  const [isCapturingRemoteAudio, setIsCapturingRemoteAudio] = useState(false);
  const recognitionRef = useRef<any>(null);
  const remoteRecognitionRef = useRef<any>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  const call = useCall();
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  // Get speaker name from participant ID
  const getSpeakerName = useCallback((participantId: string) => {
    const participant = participants.find(p => p.userId === participantId);
    return participant?.name || `User ${participantId.slice(-4)}`;
  }, [participants]);

  // Setup remote audio capture
  const setupRemoteAudioCapture = useCallback(async () => {
    try {
      if (!call || !isListeningToAll) return;

      // Initialize Web Audio API for remote audio processing
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Request access to audio for capturing remote streams
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      audioStreamRef.current = stream;

      // Create analyzer for remote audio
      const analyzer = context.createAnalyser();
      analyzer.fftSize = 2048;

      // Setup secondary recognition for mixed audio
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        remoteRecognitionRef.current = new SpeechRecognition();
        remoteRecognitionRef.current.continuous = true;
        remoteRecognitionRef.current.interimResults = true;
        remoteRecognitionRef.current.lang = 'en-US';
        
        remoteRecognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript.trim()) {
            // This captures mixed audio - we'll attribute it to remote if it doesn't match local
            const cleanTranscript = finalTranscript.trim();
            if (cleanTranscript.split(' ').length >= 2) {
              // Create entry for mixed/remote audio
              const mixedEntry: TranscriptEntry = {
                id: `mixed-${Date.now()}`,
                speaker: 'Multiple Speakers',
                speakerId: 'mixed-audio',
                text: cleanTranscript,
                timestamp: new Date(),
                confidence: event.results[event.resultIndex][0].confidence || 0.8,
                isLocal: false,
                audioSource: 'mixed'
              };

              setTranscripts(prev => {
                // Avoid duplicates by checking recent entries
                const recentEntries = prev.slice(-3);
                const isDuplicate = recentEntries.some(entry => 
                  entry.text.toLowerCase() === cleanTranscript.toLowerCase() &&
                  Date.now() - entry.timestamp.getTime() < 5000
                );
                
                if (!isDuplicate) {
                  return [...prev, mixedEntry];
                }
                return prev;
              });

              // Broadcast mixed audio transcript
              if (call) {
                call.sendCustomEvent({
                  type: 'transcript_update',
                  data: {
                    speaker: mixedEntry.speaker,
                    speakerId: mixedEntry.speakerId,
                    text: mixedEntry.text,
                    timestamp: mixedEntry.timestamp.toISOString(),
                    confidence: mixedEntry.confidence,
                    audioSource: 'mixed'
                  }
                }).catch(console.error);
              }
            }
          }
        };
      }

      setIsCapturingRemoteAudio(true);
      toast({
        title: '🎧 Enhanced Audio Capture',
        description: 'Now capturing audio from all participants',
      });

    } catch (error) {
      console.error('Error setting up remote audio capture:', error);
      toast({
        title: '❌ Audio Capture Error',
        description: 'Could not access enhanced audio capture',
        variant: 'destructive'
      });
    }
  }, [call, isListeningToAll, toast]);

  // Initialize speech recognition and audio capture
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        // Local user recognition
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 3;

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

          if (finalTranscript && localParticipant) {
            const cleanTranscript = finalTranscript.trim();
            if (cleanTranscript.split(' ').length >= 2) {
              const newEntry: TranscriptEntry = {
                id: `local-${Date.now()}`,
                speaker: getSpeakerName(localParticipant.userId),
                speakerId: localParticipant.userId,
                text: cleanTranscript,
                timestamp: new Date(),
                confidence: event.results[event.resultIndex][0].confidence || 0.9,
                isLocal: true,
                audioSource: 'local'
              };

              setTranscripts(prev => [...prev, newEntry]);

              // Broadcast to other participants via Stream
              if (call && isListeningToAll) {
                call.sendCustomEvent({
                  type: 'transcript_update',
                  data: {
                    speaker: newEntry.speaker,
                    speakerId: newEntry.speakerId,
                    text: newEntry.text,
                    timestamp: newEntry.timestamp.toISOString(),
                    confidence: newEntry.confidence,
                    audioSource: 'local'
                  }
                }).catch(console.error);
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
              variant: 'destructive'
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

        // Setup remote audio capture for all participants
        if (isListeningToAll && call) {
          setupRemoteAudioCapture();
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (remoteRecognitionRef.current) {
        remoteRecognitionRef.current.stop();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isTranscribing, localParticipant, getSpeakerName, call, isListeningToAll, toast, setupRemoteAudioCapture]);

  // Listen for transcript updates from other participants
  useEffect(() => {
    if (!call) return;

    const handleCustomEvent = (event: any) => {
      if (event.type === 'transcript_update' && event.data.speakerId !== localParticipant?.userId) {
        const remoteEntry: TranscriptEntry = {
          id: `remote-${event.data.speakerId}-${Date.now()}`,
          speaker: event.data.speaker,
          speakerId: event.data.speakerId,
          text: event.data.text,
          timestamp: new Date(event.data.timestamp),
          confidence: event.data.confidence,
          isLocal: false,
          audioSource: event.data.audioSource || 'remote'
        };

        setTranscripts(prev => {
          // Avoid duplicates from multiple sources
          const recentEntries = prev.slice(-5);
          const isDuplicate = recentEntries.some(entry => 
            entry.text.toLowerCase() === remoteEntry.text.toLowerCase() &&
            Math.abs(entry.timestamp.getTime() - remoteEntry.timestamp.getTime()) < 3000
          );
          
          if (!isDuplicate) {
            return [...prev, remoteEntry];
          }
          return prev;
        });
      }
    };

    call.on('custom', handleCustomEvent);

    return () => {
      call.off('custom', handleCustomEvent);
    };
  }, [call, localParticipant]);

  const startTranscription = async () => {
    try {
      if (!recognitionRef.current) {
        toast({
          title: 'Speech Recognition Not Supported',
          description: 'Your browser does not support speech recognition.',
          variant: 'destructive'
        });
        return;
      }

      setIsTranscribing(true);
      recognitionRef.current.start();

      // Start remote audio capture if in multi-user mode
      if (isListeningToAll && remoteRecognitionRef.current) {
        try {
          remoteRecognitionRef.current.start();
        } catch (error) {
          console.warn('Remote recognition already started or failed:', error);
        }
      }
      
      toast({
        title: '🎤 AI Transcription Started',
        description: isListeningToAll 
          ? `Recording all ${participants.length} participants` 
          : 'Recording your voice only',
      });
    } catch (error) {
      console.error('Error starting transcription:', error);
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

    if (remoteRecognitionRef.current) {
      remoteRecognitionRef.current.stop();
    }
    
    toast({
      title: '🛑 AI Transcription Stopped',
      description: 'All transcription services have been stopped',
    });
  };

  const toggleAllParticipantsMode = async () => {
    const newMode = !isListeningToAll;
    setIsListeningToAll(newMode);
    
    if (newMode && !isCapturingRemoteAudio) {
      await setupRemoteAudioCapture();
    }
    
    toast({
      title: newMode ? '🎧 Multi-Participant Mode' : '🎤 Personal Mode',
      description: newMode 
        ? `Now capturing audio from all ${participants.length} participants` 
        : 'Now recording your voice only',
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

        const timeStr = transcript.timestamp.toLocaleTimeString();
        const confidenceStr = `(${Math.round(transcript.confidence * 100)}% confidence)`;
        const speakerLine = `[${timeStr}] ${transcript.speaker} ${confidenceStr}:`;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(speakerLine, margin, yPosition);
        yPosition += lineHeight;

        pdf.setFont('helvetica', 'normal');
        const textLines = pdf.splitTextToSize(transcript.text, pageWidth - 2 * margin);
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
    <div className="flex h-full w-full flex-col bg-gradient-to-br from-dark-1/95 to-dark-2/95 backdrop-blur-lg border-l border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-purple-1 to-pink-1 p-2">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-3 to-pink-3 bg-clip-text text-transparent">
              AI Transcription
            </h3>
            <p className="text-xs text-white/60">
              {isListeningToAll 
                ? `Enhanced mode - ${participants.length} participants` 
                : 'Personal mode'
              }
              {isCapturingRemoteAudio && (
                <span className="ml-2 text-blue-400">• Multi-audio</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">{transcripts.length} entries</span>
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
            size="sm"
            className={`flex items-center gap-2 ${
              isTranscribing
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
            {isListeningToAll ? <Headphones size={16} /> : <Volume2 size={16} />}
            {isListeningToAll ? 'Enhanced' : 'Personal'}
          </Button>

          <Button
            onClick={resetTranscription}
            size="sm"
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-semibold transition-all duration-300"
          >
            <RotateCcw size={16} />
            Reset
          </Button>

          <Button
            onClick={generatePDF}
            disabled={transcripts.length === 0 || isGeneratingPDF}
            size="sm"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
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
                <div className="text-xl font-bold text-blue-400">{transcripts.length}</div>
                <div className="text-white/60">Total Messages</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">{new Set(transcripts.map(t => t.speakerId)).size}</div>
                <div className="text-white/60">Active Speakers</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transcription Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {transcripts.length === 0 && !isTranscribing ? (
          <div className="text-center py-8">
            <div className="mb-4 rounded-xl bg-gradient-to-br from-blue-1/20 to-purple-1/20 p-6">
              <Mic size={32} className="text-blue-400 mx-auto mb-2" />
            </div>
            <p className="text-white/60 text-sm mb-4">
              Start AI transcription to capture and transcribe speech in real-time
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
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30'
                    : transcript.audioSource === 'mixed'
                    ? 'bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-400/30'
                    : 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 border border-gray-400/30'
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className={`text-sm font-semibold ${
                    transcript.isLocal 
                      ? 'text-blue-400' 
                      : transcript.audioSource === 'mixed'
                      ? 'text-green-400'
                      : 'text-white'
                  }`}>
                    {transcript.speaker}
                    {transcript.isLocal && (
                      <span className="ml-2 text-xs text-blue-300">(You)</span>
                    )}
                    {transcript.audioSource === 'mixed' && (
                      <span className="ml-2 text-xs text-green-300">(Multi-audio)</span>
                    )}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Clock size={12} />
                    <span>{formatTime(transcript.timestamp)}</span>
                    <span className={`font-mono ${getConfidenceColor(transcript.confidence)}`}>
                      {Math.round(transcript.confidence * 100)}%
                    </span>
                    {transcript.audioSource && (
                      <span className="text-xs px-1 py-0.5 rounded bg-white/10">
                        {transcript.audioSource === 'local' ? '🎤' : transcript.audioSource === 'mixed' ? '🎧' : '📡'}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">
                  {transcript.text}
                </p>
              </div>
            ))}

            {/* Current live transcript */}
            {currentTranscript && isTranscribing && (
              <div className="rounded-xl border border-blue-400/30 border-dashed bg-blue-500/10 p-3">
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
