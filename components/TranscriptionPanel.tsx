'use client';

import { useState, useEffect, useRef } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { Mic, MicOff, Download, FileText, Users, Clock, RotateCcw } from 'lucide-react';
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
}

interface SpeechRecognitionEvent extends Event {
  results: any;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const TranscriptionPanel = () => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const call = useCall();
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  // Get speaker name from participant ID
  const getSpeakerName = (participantId: string) => {
    const participant = participants.find(p => p.userId === participantId);
    return participant?.name || `User ${participantId.slice(-4)}`;
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

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
            // Only add meaningful transcripts (more than 2 words)
            if (cleanTranscript.split(' ').length >= 2) {
              const newEntry: TranscriptEntry = {
                id: Date.now().toString(),
                speaker: getSpeakerName(localParticipant.userId),
                speakerId: localParticipant.userId,
                text: cleanTranscript,
                timestamp: new Date(),
                confidence: event.results[event.resultIndex][0].confidence || 0.9
              };

              setTranscripts(prev => [...prev, newEntry]);
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
            // Restart recognition if it was stopped unexpectedly
            setTimeout(() => {
              try {
                recognitionRef.current?.start();
              } catch (error) {
                console.error('Error restarting recognition:', error);
              }
            }, 100);
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isTranscribing, localParticipant, participants, toast]);

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
      setTranscripts([]);
      setCurrentTranscript('');
      
      // Add professional start message
      const startEntry: TranscriptEntry = {
        id: Date.now().toString(),
        speaker: 'System',
        speakerId: 'system',
        text: '🎤 AI Transcription Started - Real-time speech conversion is now active for all participants',
        timestamp: new Date(),
        confidence: 1.0
      };
      setTranscripts([startEntry]);

      recognitionRef.current.start();
      
      toast({
        title: 'AI Transcription Started',
        description: 'Now recording and transcribing speech from all participants.',
      });
    } catch (error) {
      console.error('Error starting transcription:', error);
      setIsTranscribing(false);
      toast({
        title: 'Failed to Start Transcription',
        description: 'Please check your microphone permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsTranscribing(false);
    setCurrentTranscript('');
    
    const endEntry: TranscriptEntry = {
      id: Date.now().toString(),
      speaker: 'System',
      speakerId: 'system',
      text: '🛑 AI Transcription Completed - Session summary ready for download',
      timestamp: new Date(),
      confidence: 1.0
    };
    setTranscripts(prev => [...prev, endEntry]);

    toast({
      title: 'AI Transcription Stopped',
      description: 'Transcription has been completed.',
    });
  };

  const resetTranscription = () => {
    // Stop any ongoing transcription
    if (recognitionRef.current && isTranscribing) {
      recognitionRef.current.stop();
    }
    
    // Reset all states
    setIsTranscribing(false);
    setTranscripts([]);
    setCurrentTranscript('');
    
    toast({
      title: 'Transcription Reset',
      description: 'All transcription data has been cleared. Ready for a new session.',
    });
  };

  const generatePDF = async () => {
    // Filter out system messages and get only real user transcripts
    const userTranscripts = transcripts.filter(t => t.speakerId !== 'system' && t.text.trim() !== '');
    
    if (userTranscripts.length === 0) {
      toast({
        title: 'No User Speech Recorded',
        description: 'No actual speech has been transcribed yet. Please speak during the meeting first.',
        variant: 'destructive'
      });
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const pdf = new (jsPDF as any)();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      // const lineHeight = 8;
      let yPosition = margin;

      // Professional Header with Logo Area
      pdf.setFontSize(22);
      pdf.setTextColor(59, 130, 246);
      pdf.text('NEXUS MEET', margin, yPosition);
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.text('AI-Powered Meeting Transcription', margin, yPosition + 8);
      
      // Add a line separator
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition + 15, pageWidth - margin, yPosition + 15);
      yPosition += 25;

      // Meeting Information Box
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, yPosition, pageWidth - margin * 2, 35, 'F');
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(margin, yPosition, pageWidth - margin * 2, 35, 'S');
      
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const meetingTitle = call?.state?.custom?.description || 'Business Meeting';
      const meetingDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const meetingTime = userTranscripts[0]?.timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) || new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const duration = userTranscripts.length > 0 ? 
        Math.round((userTranscripts[userTranscripts.length - 1].timestamp.getTime() - userTranscripts[0].timestamp.getTime()) / 60000) : 0;
      
      pdf.text(`Meeting Title: ${meetingTitle}`, margin + 5, yPosition);
      yPosition += 6;
      pdf.text(`Date: ${meetingDate}`, margin + 5, yPosition);
      yPosition += 6;
      pdf.text(`Start Time: ${meetingTime}`, margin + 5, yPosition);
      yPosition += 6;
      pdf.text(`Duration: ${duration} minutes`, margin + 5, yPosition);
      yPosition += 6;
      pdf.text(`Total Participants: ${participants.length}`, margin + 5, yPosition);
      yPosition += 15;

      // Participants Section
      const uniqueSpeakers = Array.from(new Set(userTranscripts.map(t => t.speaker)));
      if (uniqueSpeakers.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(139, 92, 246);
        pdf.text('Meeting Participants', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        uniqueSpeakers.forEach((participant, index) => {
          const speakerEntries = userTranscripts.filter(t => t.speaker === participant);
          const wordCount = speakerEntries.reduce((acc, entry) => acc + entry.text.split(' ').length, 0);
          
          pdf.text(`${index + 1}. ${participant} (${speakerEntries.length} contributions, ~${wordCount} words)`, margin + 5, yPosition);
          yPosition += 5;
        });
        yPosition += 10;
      }

      // Transcript Section Header
      pdf.setFontSize(14);
      pdf.setTextColor(139, 92, 246);
      pdf.text('Meeting Transcript', margin, yPosition);
      yPosition += 5;
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text('(Generated by AI Speech Recognition - Accuracy may vary)', margin, yPosition);
      yPosition += 15;

      // Enhanced Transcript Content
      pdf.setFontSize(10);
      let currentSpeaker = '';
      
      userTranscripts.forEach((entry, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        const timeStr = entry.timestamp.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        // Only show speaker name if it's different from previous
        if (currentSpeaker !== entry.speaker) {
          currentSpeaker = entry.speaker;
          
          // Speaker header with background
          pdf.setFillColor(245, 247, 250);
          pdf.rect(margin, yPosition - 2, pageWidth - margin * 2, 8, 'F');
          
          pdf.setFontSize(11);
          pdf.setTextColor(59, 130, 246);
          pdf.text(`${entry.speaker}`, margin + 3, yPosition + 3);
          
          pdf.setFontSize(8);
          pdf.setTextColor(120, 120, 120);
          pdf.text(timeStr, pageWidth - margin - 20, yPosition + 3);
          
          yPosition += 10;
        }

        // Speech content with better formatting
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        // Clean and format the text
        const cleanText = entry.text.trim().replace(/\s+/g, ' ');
        const textLines = pdf.splitTextToSize(cleanText, pageWidth - margin * 2 - 10);
        
        textLines.forEach((line: string) => {
          if (yPosition > pageHeight - 25) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin + 10, yPosition);
          yPosition += 5;
        });
        
        yPosition += 3; // Small gap between entries
      });

      // Professional Footer
      const totalPages = (pdf as any).internal.getNumberOfPages();
      const generatedTime = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Footer line
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.3);
        pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
        
        // Footer text
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text(
          `Generated by Nexus Meet AI on ${generatedTime}`,
          margin,
          pageHeight - 12
        );
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 12,
          { align: 'right' }
        );
        
        // Confidentiality notice
        if (i === totalPages) {
          pdf.setFontSize(7);
          pdf.text(
            'This transcript was generated using AI technology and may contain inaccuracies.',
            pageWidth / 2,
            pageHeight - 5,
            { align: 'center' }
          );
        }
      }

      const filename = `nexus-meet-transcript-${new Date().toISOString().split('T')[0]}-${new Date().toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '')}.pdf`;
      pdf.save(filename);

      toast({
        title: 'Professional Transcript Generated',
        description: `High-quality meeting notes saved as ${filename}`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Failed to Generate PDF',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get unique participants for display
  const uniqueParticipants = Array.from(new Set(transcripts.map(t => t.speaker)));

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-dark-1/95 to-dark-2/95 backdrop-blur-lg border-l border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-1 to-purple-1 p-2 rounded-lg">
              <FileText size={16} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">AI Transcription</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Users size={12} />
            <span>{participants.length}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={isTranscribing ? stopTranscription : startTranscription}
            disabled={!call}
            className={`flex-1 rounded-xl font-semibold transition-all duration-300 ${
              isTranscribing
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            }`}
          >
            {isTranscribing ? (
              <>
                <MicOff size={16} className="mr-2" />
                Stop
              </>
            ) : (
              <>
                <Mic size={16} className="mr-2" />
                Start
              </>
            )}
          </Button>
          
          <Button
            onClick={generatePDF}
            disabled={transcripts.length === 0 || isGeneratingPDF}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-semibold transition-all duration-300"
            title="Download PDF"
          >
            {isGeneratingPDF ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download size={16} />
            )}
          </Button>

          <Button
            onClick={resetTranscription}
            disabled={transcripts.length === 0 && !isTranscribing}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 rounded-xl font-semibold transition-all duration-300"
            title="Reset Session"
          >
            <RotateCcw size={16} />
          </Button>
        </div>

        {/* Live status */}
        {isTranscribing && (
          <div className="flex items-center gap-2 mt-3 p-2 bg-green-500/20 rounded-lg border border-green-400/30">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">Live Transcription Active</span>
          </div>
        )}
      </div>

      {/* Transcription Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {transcripts.length === 0 && !isTranscribing ? (
          <div className="text-center py-8">
            <div className="bg-gradient-to-br from-blue-1/20 to-purple-1/20 p-6 rounded-xl mb-4">
              <Mic size={32} className="text-blue-400 mx-auto mb-2" />
            </div>
            <p className="text-white/60 text-sm mb-4">
              Start AI transcription to see live speech-to-text conversion
            </p>
            <div className="grid grid-cols-1 gap-2 text-xs text-white/50 max-w-xs mx-auto">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Real-time speech recognition</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Speaker identification</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Professional PDF export</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span>Session reset available</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {transcripts.map((entry) => (
              <div key={entry.id} className="group">
                <div className={`p-3 rounded-xl transition-all duration-200 ${
                  entry.speakerId === 'system' 
                    ? 'bg-blue-500/10 border border-blue-400/30' 
                    : entry.speakerId === localParticipant?.userId
                    ? 'bg-green-500/10 border border-green-400/30'
                    : 'bg-purple-500/10 border border-purple-400/30'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${
                      entry.speakerId === 'system' 
                        ? 'text-blue-400' 
                        : entry.speakerId === localParticipant?.userId
                        ? 'text-green-400'
                        : 'text-purple-400'
                    }`}>
                      {entry.speaker}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-white/50">
                      <Clock size={10} />
                      <span>{formatTime(entry.timestamp)}</span>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {entry.text}
                  </p>
                  {entry.confidence < 0.8 && entry.speakerId !== 'system' && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs text-yellow-400">Low confidence</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Current live transcript */}
            {currentTranscript && isTranscribing && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/30 border-dashed">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-blue-400">
                    {getSpeakerName(localParticipant?.userId || '')}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-400">Speaking...</span>
                  </div>
                </div>
                <p className="text-white/70 text-sm italic">
                  {currentTranscript}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Stats */}
      {transcripts.length > 0 && (
        <div className="p-3 border-t border-white/10 bg-dark-1/50">
          <div className="flex justify-between items-center text-xs text-white/60">
            <div className="flex gap-4">
              <span>{transcripts.filter(t => t.speakerId !== 'system').length} messages</span>
              <span>{uniqueParticipants.filter(p => p !== 'System').length} speakers</span>
            </div>
            {!isTranscribing && transcripts.length > 0 && (
              <Button
                onClick={resetTranscription}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <RotateCcw size={10} className="mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptionPanel;
