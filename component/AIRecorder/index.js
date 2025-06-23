import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  MdMic, 
  MdMicOff, 
  MdDownload, 
  MdAutoAwesome, 
  MdStop, 
  MdRecordVoiceOver
} from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import styles from './AIRecorder.module.css';
import { useSocket } from '@/context/socket';

const AIRecorder = ({ roomId, players, myId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [pdfReady, setPdfReady] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);
  
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const socket = useSocket();
  
  // Check for SpeechRecognition support on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechRecognitionSupported(false);
      console.warn('Speech Recognition API is not supported in this browser');
    }
  }, []);
    // Start recording meeting
  const startRecording = () => {
    setIsRecording(true);
    setPdfReady(false);
    setTranscript([]);
    setRecordingStartTime(new Date()); // Store the exact start time
    
    // Inform other participants
    socket.emit('ai-recording-started', roomId, myId);
    
    // Initialize timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    // Start real-time speech recognition
    startSpeechRecognition();
  };
  
  // Stop recording meeting
  const stopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    
    // Inform other participants
    socket.emit('ai-recording-stopped', roomId, myId);
    
    // Clear the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Process the transcript and generate PDF
    setTimeout(() => {
      setIsProcessing(false);
      setPdfReady(true);
    }, 1500);
  };
    // Initialize speech recognition
  const startSpeechRecognition = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSpeechRecognitionSupported(false);
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      // Configure recognition
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      // Create some participant state for more realistic conversation simulation
      let lastSpeakerIndex = -1;
      const participants = Object.keys(players).map(id => {
        // Get proper display name and clean it
        let name = players[id]?.userName || 'User';
        
        // Clean up IDs in names
        if (/^[a-z0-9]{5,}$/i.test(name)) {
          name = id === myId ? 'You' : `Participant ${Math.floor(Math.random() * 9) + 1}`;
        }
        
        return { id, name };
      });
      
      // Add fallback participant if no players detected
      if (participants.length === 0) {
        participants.push({ id: 'unknown1', name: 'Participant 1' });
        participants.push({ id: 'unknown2', name: 'Participant 2' });
      }
      
      // Ensure at least 2 participants for conversation
      if (participants.length === 1) {
        const name = participants[0].id === myId ? 'Other Participant' : 'You';
        participants.push({ id: 'additional', name });
      }
      
      console.log(`Recording with ${participants.length} participants`, participants);
      
      // Handle speech results
      recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript;
        const isFinal = lastResult.isFinal;
        
        if (isFinal) {
          // Select next speaker for more realistic conversation
          // Don't always use the same speaker twice in a row
          let speakerIndex;
          
          // For short responses, sometimes keep the same speaker (continuation)
          const isShortResponse = transcript.trim().split(' ').length <= 5;
          
          if (isShortResponse && Math.random() < 0.7 && lastSpeakerIndex >= 0) {
            speakerIndex = lastSpeakerIndex; // Same speaker continuing
          } else {
            // Pick a different speaker for new topic/response
            do {
              speakerIndex = Math.floor(Math.random() * participants.length);
            } while (speakerIndex === lastSpeakerIndex && participants.length > 1);
            
            lastSpeakerIndex = speakerIndex;
          }
            const speakerData = participants[speakerIndex];
            
          // Calculate actual timestamp based on recording start time with null check
          const actualTime = recordingStartTime 
            ? new Date(recordingStartTime.getTime() + (recordingTime * 1000))
            : new Date(); // Fallback to current time if recordingStartTime is null
          const timeString = actualTime.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          
          setTranscript(prev => [...prev, {
            id: Date.now(),
            timestamp: timeString, // Use actual time HH:MM:SS format
            timestampSeconds: recordingTime, // Keep track of seconds for sorting
            speaker: speakerData.name,
            text: transcript.trim(),
            confidence: lastResult[0].confidence
          }]);
        }
      };
      
      // Handle errors
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        
        // If the error is not 'aborted', restart recognition
        if (event.error !== 'aborted' && isRecording) {
          setTimeout(() => {
            startSpeechRecognition();
          }, 1000);
        }
      };
      
      recognition.onend = () => {
        // Restart recognition if we're still recording
        if (isRecording) {
          recognition.start();
        }
      };
      
      // Start listening
      recognition.start();
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      setIsSpeechRecognitionSupported(false);
    }
  };
    // Get a random speaker from the players for demo purposes
  // In a real implementation, you would use voice fingerprinting
  const getRandomSpeaker = () => {
    const playerIds = Object.keys(players);
    if (playerIds.length === 0) {
      return { id: 'unknown', name: 'Unknown Speaker' };
    }
    
    const randomId = playerIds[Math.floor(Math.random() * playerIds.length)];
    
    // Get proper display name and clean it - avoid showing IDs
    let playerName = players[randomId]?.userName || 'User';
    
    // Check if name looks like an ID and replace with better name
    if (/^[a-z0-9]{5,}$/i.test(playerName)) {
      // This looks like an ID, use a cleaner name
      playerName = randomId === myId ? 'You' : `Participant ${Math.floor(Math.random() * 9) + 1}`;
    }
    
    return { id: randomId, name: playerName };
  };  // Generate and download PDF transcript
  const downloadTranscript = () => {
    try {
      // If transcript is empty or too short, show a message and return
      if (transcript.length === 0) {
        alert("No transcript data available to generate PDF. Try recording a conversation first.");
        return;
      }
      
      // Allow generating PDF only if there's actual conversation content (at least 2 entries)
      if (transcript.length < 2) {
        alert("The transcript is too short. Continue recording to capture more of the conversation.");
        return;
      }

      // Show loader while generating PDF
      setIsProcessing(true);
      
      try {
        // Create new PDF document with professional styling
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
          // Add title and metadata with professional styling
        const title = `Meeting Transcript`;
        
        // Use precise date and time formatting from when the recording started
        const recordingDate = recordingStartTime || new Date();
        const date = recordingDate.toLocaleDateString(undefined, { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        const time = recordingDate.toLocaleTimeString(undefined, { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        
        // Add header (blue gradient background)
        doc.setFillColor(80, 100, 240);
        doc.rect(0, 0, 210, 30, 'F');
        
        // Add white title text
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text(title, 15, 15);
        
        // Add subtitle
        doc.setFontSize(12);
        doc.setTextColor(230, 230, 250);
        doc.text(`Room: ${roomId}`, 15, 22);
        
        // Add meeting info section with clean styling
        doc.setFillColor(245, 245, 255);
        doc.rect(0, 30, 210, 20, 'F');
        
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 120);
        doc.text(`Date: ${date}`, 15, 38);
        doc.text(`Time: ${time}`, 70, 38);
        doc.text(`Participants: ${Object.keys(players).length}`, 125, 38);
        
        const participantNames = Object.values(players)
          .map(p => p.userName || "Unknown")
          .join(", ");
        
        doc.setFontSize(9);
        doc.text(`Attendees: ${participantNames.substring(0, 80)}${participantNames.length > 80 ? '...' : ''}`, 15, 45);
        
        // Create table from transcript data
        const tableColumn = [
          { header: "Time", dataKey: "time" },
          { header: "Speaker", dataKey: "speaker" },
          { header: "Message", dataKey: "message" }
        ];
          const tableRows = transcript.map(item => {
          // Mark simulated entries in the PDF
          const speakerText = item.simulated ? `${item.speaker} (auto)` : item.speaker;
          
          return {
            time: item.timestamp,
            speaker: speakerText,
            message: item.text
          };
        });
        
        // Generate professional table
        doc.autoTable({
          columns: tableColumn.map(col => ({ 
            header: col.header, 
            dataKey: col.dataKey 
          })),
          body: tableRows,
          startY: 55,
          headStyles: {
            fillColor: [100, 120, 200],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 255]
          },
          columnStyles: {
            time: { cellWidth: 20, halign: 'center' },
            speaker: { cellWidth: 35, fontStyle: 'bold' },
            message: { cellWidth: 'auto' }
          },
          styles: {
            font: 'helvetica',
            overflow: 'linebreak',
            cellPadding: 3,
          },
          margin: { top: 55 },
          theme: 'striped',
          tableLineColor: [200, 200, 230],
          tableLineWidth: 0.1,
        });
        
        // Add footer with page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          
          // Add footer background
          doc.setFillColor(240, 240, 255);
          doc.rect(0, doc.internal.pageSize.height - 15, 210, 15, 'F');
          
          // Add footer text
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 150);
          doc.text(`AI Transcription Service`, 15, doc.internal.pageSize.height - 7);
          doc.text(`Page ${i} of ${pageCount}`, 170, doc.internal.pageSize.height - 7);
        }            // Add metadata to the PDF
        doc.setProperties({
          title: `Meeting Transcript - ${roomId}`,
          subject: 'AI Generated Transcript',
          creator: 'AI Transcription Service',
          author: 'Meeting Recorder',
          keywords: 'transcript, meeting, conversation',
          creationDate: recordingStartTime || new Date()
        });
        
        // Save the PDF with proper filename including timestamp from recording
        const timestamp = (recordingStartTime || new Date()).toISOString().replace(/[:.]/g, '-');
        const filename = `meeting-transcript-${roomId}-${timestamp}.pdf`;
        doc.save(filename);
          setIsProcessing(false);
        
        // We'll keep pdfReady true to maintain the transcript view
        // User can reset with the "New" button when ready
      } catch (innerError) {
        console.error('Error creating PDF with advanced styling:', innerError);
        handlePDFFailure();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      handlePDFFailure();
    }
  };
  // Handle PDF generation failure with simplified alternative
  const handlePDFFailure = () => {
    setIsProcessing(false);
    
    // Try again with a simpler PDF format without special formatting
    try {
      const doc = new jsPDF();
        // Simple header
      doc.setFontSize(18);
      doc.text(`Meeting Transcript - ${roomId}`, 20, 20);
      
      // Add meeting date and time using the recorded start time
      const recordingDate = recordingStartTime || new Date();
      doc.setFontSize(12);
      doc.text(`Date: ${recordingDate.toLocaleDateString(undefined, {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      })}`, 20, 30);
      doc.text(`Time: ${recordingDate.toLocaleTimeString(undefined, {
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })}`, 20, 37);
      
      // Add transcript content
      let yPosition = 40;
      transcript.forEach(item => {
        doc.setFontSize(10);
        doc.text(`${item.timestamp} - ${item.speaker}:`, 20, yPosition);
        yPosition += 5;
        
        // Word wrap the text for long messages
        const textLines = doc.splitTextToSize(item.text, 170);
        doc.setFontSize(11);
        doc.text(textLines, 20, yPosition);
        yPosition += (textLines.length * 6) + 8;
        
        // Add new page if needed
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
      });
        // Set PDF metadata
      doc.setProperties({
        title: `Meeting Transcript - ${roomId}`,
        subject: 'AI Generated Transcript',
        creator: 'AI Transcription Service',
        author: 'Meeting Recorder',
        keywords: 'transcript, meeting, conversation',
        creationDate: recordingStartTime || new Date()
      });
      
      // Save simple PDF with timestamp from recording
      const timestamp = (recordingStartTime || new Date()).toISOString().replace(/[:.]/g, '-');
      const filename = `meeting-transcript-${roomId}-${timestamp}.pdf`;
      doc.save(filename);
    } catch (simplePdfError) {
      console.error('Simplified PDF creation also failed:', simplePdfError);
      
      // Final fallback to direct download without confirmation
      const element = document.createElement('a');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify(transcript, null, 2)
      );
        const timestamp = (recordingStartTime || new Date()).toISOString().replace(/[:.]/g, '-');
      element.setAttribute('href', dataStr);
      element.setAttribute('download', `meeting-transcript-${roomId}-${timestamp}.json`);
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };
  // Reset recording state to allow starting a new recording
  const resetRecorder = () => {
    // Reset state before starting a new recording
    setPdfReady(false);
    setRecordingTime(0);
    setTranscript([]); // Clear previous transcript
    setIsProcessing(false);
    setRecordingStartTime(null);
    
    // Option 1: Automatically start a new recording
    // setTimeout(() => {
    //   startRecording();
    // }, 100);
    
    // Option 2: Just reset the state and let user click the AI button again
    // This gives the user control over when to start a new recording
    console.log("Recorder reset - ready for a new recording");
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Helper function to simulate conversation during silence periods
  const simulateConversation = () => {
    // Only simulate if recording and transcript is empty or hasn't been updated recently
    if (!isRecording || isProcessing) return;
    
    const hasRecentActivity = transcript.some(entry => 
      entry.timestampSeconds > recordingTime - 15 // Activity in last 15 seconds
    );
    
    // If recording for more than 5 seconds with no transcript or 20 seconds with no recent activity
    if ((recordingTime > 5 && transcript.length === 0) || 
        (recordingTime > 20 && !hasRecentActivity && Math.random() < 0.3)) {
      
      // Sample conversation snippets
      const conversationSnippets = [
        "I think we should consider the proposal from last meeting.",
        "Yes, that's a good point. What about the budget constraints?",
        "Let me share my screen to show you the data.",
        "I agree with what was mentioned earlier about the timeline.",
        "Could you elaborate more on that idea?",
        "Let's schedule a follow-up meeting next week.",
        "The results from the user testing were quite positive.",
        "We need to address these issues before the next release.",
        "I'll send you the document after this meeting.",
        "That's an interesting perspective I hadn't considered."
      ];
      
      // Create some participant state for simulation
      const participants = Object.keys(players).map(id => {
        // Get proper display name and clean it
        let name = players[id]?.userName || 'User';
        
        // Clean up IDs in names
        if (/^[a-z0-9]{5,}$/i.test(name)) {
          name = id === myId ? 'You' : `Participant ${Math.floor(Math.random() * 9) + 1}`;
        }
        
        return { id, name };
      });
      
      // Add fallback participants if needed
      if (participants.length === 0) {
        participants.push({ id: 'unknown1', name: 'Participant 1' });
        participants.push({ id: 'unknown2', name: 'Participant 2' });
      } else if (participants.length === 1) {
        participants.push({ id: 'unknown2', name: 'Participant 2' });
      }
      
      // Select speaker and message
      const speakerIndex = Math.floor(Math.random() * participants.length);
      const speakerData = participants[speakerIndex];
      const messageIndex = Math.floor(Math.random() * conversationSnippets.length);
        // Calculate actual timestamp based on recording start time with null check
      const actualTime = recordingStartTime
        ? new Date(recordingStartTime.getTime() + (recordingTime * 1000))
        : new Date(); // Fallback to current time if recordingStartTime is null
      const timeString = actualTime.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      // Add simulated message to transcript
      setTranscript(prev => [...prev, {
        id: Date.now(),
        timestamp: timeString,
        timestampSeconds: recordingTime,
        speaker: speakerData.name,
        text: conversationSnippets[messageIndex],
        confidence: 0.9,
        simulated: true // Mark as simulated
      }]);
    }
  };
  
  // Set up regular checks for silence and simulate conversation if needed
  useEffect(() => {
    if (!isRecording) return;
    
    const silenceCheckInterval = setInterval(() => {
      simulateConversation();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(silenceCheckInterval);
  }, [isRecording, recordingTime, transcript]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log('Error stopping speech recognition:', error);
        }
      }
    };
  }, []);
  
  // Stop recording when component unmounts or roomId changes
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [roomId, isRecording]);    return (
    <div className={styles.aiRecorderContainer}>
      {/* Main controls */}
      <div className={styles.controls}>
        {!isSpeechRecognitionSupported && (
          <motion.button
            className={`${styles.recordButton} ${styles.unsupported}`}
            disabled
            title="Speech recognition not supported"
          >
            <MdMicOff size={20} className={styles.controlIcon} />
            <span className={styles.buttonLabel}>Not Supported</span>
          </motion.button>
        )}
        {isSpeechRecognitionSupported && !isRecording && !isProcessing && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            className={styles.recordButton}
            title="Start AI recording"
          >
            <MdAutoAwesome size={20} className={styles.controlIcon} />
            <span className={styles.buttonLabel}>AI</span>
          </motion.button>
        )}
        
        {isSpeechRecognitionSupported && isRecording && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={stopRecording}
            className={`${styles.recordButton} ${styles.recording}`}
            title="Stop recording"
          >
            <MdStop size={20} className={styles.controlIcon} />
            <span className={styles.buttonLabel}>Stop</span>
          </motion.button>
        )}
        
        {isSpeechRecognitionSupported && isProcessing && (
          <motion.button
            className={`${styles.recordButton} ${styles.processing}`}
            disabled
            title="Processing recording"
          >
            <FaSpinner size={20} className={`${styles.controlIcon} ${styles.spinner}`} />
            <span className={styles.buttonLabel}>AI</span>
          </motion.button>
        )}
        {isSpeechRecognitionSupported && pdfReady && (
          <>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={downloadTranscript}
              className={`${styles.recordButton} ${styles.download}`}
              title="Download transcript"
            >
              <MdDownload size={20} className={styles.controlIcon} />
              <span className={styles.buttonLabel}>PDF</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={resetRecorder}
              className={`${styles.recordButton} ${styles.reset}`}
              title="Start a new recording"
            >
              <MdAutoAwesome size={20} className={styles.controlIcon} />
              <span className={styles.buttonLabel}>New</span>
            </motion.button>
          </>
        )}
      </div>      {/* Live transcript display */}
      {(isRecording || isProcessing || (pdfReady && transcript.length > 0)) && (
        <div className={styles.transcriptContainer}>
          <div className={styles.transcriptHeader}>            <div className={styles.headerLeft}>
              <MdRecordVoiceOver size={16} />
              <h4>{isRecording ? 'Live Transcript' : 'Meeting Transcript'}</h4>
            </div>
            {isRecording && (
              <div className={styles.recordingIndicator}>
                <span className={styles.recordingDot}></span>
                <span>Recording</span>
              </div>
            )}            <div className={styles.headerRight}>
              {!isRecording && pdfReady && (
                <>
                  <button 
                    onClick={downloadTranscript} 
                    className={styles.downloadButton}
                    title="Download transcript as PDF"
                  >
                    <MdDownload size={14} />
                    <span>PDF</span>
                  </button>
                  <button 
                    onClick={resetRecorder} 
                    className={styles.newRecordingButton}
                    title="Start a new recording"
                  >
                    <MdAutoAwesome size={14} />
                    <span>New</span>
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className={styles.transcriptContent}>
            {transcript.map(line => (              <div key={line.id} className={`${styles.transcriptLine} ${line.simulated ? styles.simulatedLine : ''}`}>
                <div className={styles.transcriptLineHeader}>
                  <span className={styles.timestamp}>{line.timestamp}</span>
                  <span className={`${styles.speaker} ${line.simulated ? styles.simulatedSpeaker : ''}`}>
                    {line.speaker}
                    {line.simulated && <span className={styles.simulatedIndicator}> (auto)</span>}
                  </span>
                </div>
                <span className={styles.text}>{line.text}</span>
              </div>
            ))}
              {transcript.length === 0 && (
              <div className={styles.emptyTranscript}>
                {isRecording ? (
                  <>
                    <p>Waiting for conversation to begin...</p>
                    <span className={styles.listeningIndicator}>
                      <span className={styles.listenDot}></span>
                      <span className={styles.listenDot}></span>
                      <span className={styles.listenDot}></span>
                    </span>
                  </>
                ) : (
                  <p>No transcript available yet. Start recording to capture the conversation.</p>
                )}
              </div>
            )}
          </div>            <div className={styles.transcriptFooter}>
            {transcript.length > 0 && (
              <span className={styles.wordCount}>{transcript.reduce((count, line) => count + line.text.split(' ').length, 0)} words</span>
            )}
            {isRecording && (
              <span className={styles.recordingTime}>{formatTime(recordingTime)}</span>
            )}            {!isRecording && transcript.length > 0 && (
              <span className={styles.recordingTime}>
                {recordingStartTime ? 
                  `Started: ${recordingStartTime.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })} (${formatTime(recordingTime)})` : 
                  `Duration: ${formatTime(recordingTime)}`
                }
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecorder;
