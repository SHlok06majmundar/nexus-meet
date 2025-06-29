import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MdFiberManualRecord,
  MdStop, 
  MdDownload, 
  MdDelete,
  MdVideocam
} from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import styles from './LocalRecorder.module.css';
import { useSocket } from '@/context/socket';

const LocalRecorder = ({ roomId, myStream, players, myId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingReady, setRecordingReady] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [recordingBlob, setRecordingBlob] = useState(null);
  
  const recorderRef = useRef(null);
  const timerRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamsRef = useRef([]);
  const audioContextRef = useRef(null);
  const audioDestinationRef = useRef(null);
  const audioSourcesRef = useRef([]);
  const socket = useSocket();
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Find supported MIME type for video recording
  const getSupportedMimeType = () => {
    const possibleTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4'
    ];
    
    for (const type of possibleTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return 'video/webm'; // Default fallback
  };

  // Create a mixed audio stream combining all participants' audio
  const createMixedAudioStream = () => {
    try {
      // Log the available players and audio tracks for debugging
      console.log('Checking available participants for audio mixing:');
      console.log('Local user audio track available:', myStream && myStream.getAudioTracks().length > 0);
      console.log('Number of remote participants:', Object.keys(players || {}).length);
      
      Object.entries(players || {}).forEach(([id, player]) => {
        console.log(`Remote participant ${id} has audio:`, player && player.stream && player.stream.getAudioTracks().length > 0);
      });
      
      // Create audio context with high quality settings
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 48000
      });
      audioContextRef.current = audioContext;
      
      // Create a destination for all audio to be mixed into
      const audioDestination = audioContext.createMediaStreamDestination();
      audioDestinationRef.current = audioDestination;
      
      console.log('Creating mixed audio stream from all participants');
      
      // Create gain nodes to control volume levels
      const localGain = audioContext.createGain();
      localGain.gain.value = 1.0; // Full volume for local audio
      
      const remoteGain = audioContext.createGain();
      remoteGain.gain.value = 1.2; // Slightly boost remote audio (adjust as needed)
      
      // Connect gains to destination
      localGain.connect(audioDestination);
      remoteGain.connect(audioDestination);
      
      let hasAnyAudio = false;
      
      // Add local audio if available
      if (myStream && myStream.getAudioTracks().length > 0) {
        try {
          const localSource = audioContext.createMediaStreamSource(myStream);
          localSource.connect(localGain);
          audioSourcesRef.current.push(localSource);
          console.log('Added local audio to mix');
          hasAnyAudio = true;
        } catch (err) {
          console.warn('Could not add local audio to mix:', err);
        }
      }
      
      // Add audio from all remote participants - this is critical for hearing others
      let remoteParticipantsAdded = 0;
      
      Object.entries(players || {}).forEach(([playerId, player]) => {
        if (playerId !== myId && player && player.stream) {
          // Check if the player's stream has audio tracks
          if (player.stream.getAudioTracks().length > 0) {
            try {
              // Create a source for this participant's audio
              const remoteSource = audioContext.createMediaStreamSource(player.stream);
              
              // Connect to the remote gain node for proper volume control
              remoteSource.connect(remoteGain);
              
              // Store for cleanup later
              audioSourcesRef.current.push(remoteSource);
              
              console.log(`Successfully added remote participant ${playerId} audio to mix`);
              remoteParticipantsAdded++;
              hasAnyAudio = true;
            } catch (err) {
              console.warn(`Could not add remote participant ${playerId} audio to mix:`, err);
            }
          } else {
            console.log(`Remote participant ${playerId} does not have audio tracks`);
          }
        }
      });
      
      console.log(`Successfully mixed audio from ${remoteParticipantsAdded} remote participants`);
      
      // If we have any audio, return the mixed stream
      if (hasAnyAudio) {
        return audioDestination.stream;
      } else {
        console.warn('No audio sources found to mix!');
        return null;
      }
    } catch (err) {
      console.error('Error creating mixed audio stream:', err);
      return null;
    }
  };

  // Check available audio sources before recording
  const checkAudioSources = () => {
    // Check local audio
    const hasLocalAudio = myStream && myStream.getAudioTracks().length > 0;
    
    // Check remote participants' audio
    let remoteAudioCount = 0;
    Object.entries(players || {}).forEach(([id, player]) => {
      if (id !== myId && player && player.stream && player.stream.getAudioTracks().length > 0) {
        remoteAudioCount++;
      }
    });
    
    console.log(`Audio source check: Local audio: ${hasLocalAudio ? 'Available' : 'Not available'}, Remote audio sources: ${remoteAudioCount}`);
    
    return {
      hasLocalAudio,
      remoteAudioCount,
      hasAnyAudio: hasLocalAudio || remoteAudioCount > 0
    };
  };

  // Start recording
  const startRecording = async () => {
    try {
      // Check audio sources first
      const audioSources = checkAudioSources();
      if (!audioSources.hasAnyAudio) {
        console.warn("No audio sources detected! Recording may not include audio.");
      } else {
        console.log(`Found ${audioSources.remoteAudioCount} remote audio sources and ${audioSources.hasLocalAudio ? '1' : '0'} local audio source`);
      }
      
      // Reset state
      setIsRecording(true);
      setRecordingReady(false);
      setRecordingBlob(null);
      setRecordingStartTime(new Date());
      recordedChunksRef.current = [];
      streamsRef.current = [];
      audioSourcesRef.current = [];
      
      // Inform others that recording has started
      if (socket) {
        socket.emit('local-recording-started', roomId, myId);
      }
      
      // Initialize timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // First approach: Try to capture system audio + video together
      let combinedStream;
      let systemAudioSuccess = false;
      
      try {
        // Try to capture screen with system audio (which includes remote participant audio from speakers)
        console.log("Attempting to capture screen with system audio...");
        const displayMediaOptions = {
          video: {
            cursor: "never",
            displaySurface: "browser",
            logicalSurface: true,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: {
            // Optimized for voice + music
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 48000,
            channelCount: 2
          },
          // Chrome-specific options that help capture system audio
          preferCurrentTab: true,
          selfBrowserSurface: "include",
          systemAudio: "include",
        };
        
        const captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        streamsRef.current.push(captureStream);
        
        // Check if we got system audio
        if (captureStream.getAudioTracks().length > 0) {
          console.log("Successfully captured screen with system audio!");
          systemAudioSuccess = true;
          combinedStream = captureStream;
        } else {
          console.log("Got screen capture but no system audio");
        }
      } catch (err) {
        console.warn("Error capturing with system audio:", err);
      }
      
      // Second approach: If system audio failed, try Web Audio API mixing approach
      if (!systemAudioSuccess) {
        console.log("System audio capture failed, trying Web Audio API mixing approach...");
        
        // Create a mixed audio stream with all participants
        const mixedAudioStream = createMixedAudioStream();
        
        // Capture screen for video only
        try {
          const videoOnlyStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              cursor: "never",
              displaySurface: "browser",
              logicalSurface: true,
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 30 }
            },
            audio: false
          });
          
          streamsRef.current.push(videoOnlyStream);
          
          // Create a new stream combining video and our mixed audio
          combinedStream = new MediaStream();
          
          // Add video track from screen capture
          if (videoOnlyStream.getVideoTracks().length > 0) {
            combinedStream.addTrack(videoOnlyStream.getVideoTracks()[0]);
          }
          
          // Add our mixed audio track with all participants
          if (mixedAudioStream && mixedAudioStream.getAudioTracks().length > 0) {
            combinedStream.addTrack(mixedAudioStream.getAudioTracks()[0]);
            console.log('Added mixed audio track with all participants to recording');
            if (mixedAudioStream) streamsRef.current.push(mixedAudioStream);
          } else {
            console.warn('Mixed audio stream not available');
            
            // Last resort: Try to capture at least local audio
            if (myStream && myStream.getAudioTracks().length > 0) {
              combinedStream.addTrack(myStream.getAudioTracks()[0]);
              console.log('Added local audio track as fallback');
            }
          }
        } catch (err) {
          console.error('Error setting up video-only screen capture:', err);
          alert(`Could not capture screen: ${err.message}. Try using a different browser.`);
          stopRecording();
          return;
        }
      }
      
      // Ensure we have a valid stream with tracks to record
      if (!combinedStream || combinedStream.getTracks().length === 0) {
        alert('No media tracks available for recording. Please ensure screen sharing is enabled.');
        stopRecording();
        return;
      }
      
      console.log(`Starting recording with ${combinedStream.getVideoTracks().length} video tracks and ${combinedStream.getAudioTracks().length} audio tracks`);
      
      // Create MediaRecorder with best available options
      const options = { 
        mimeType: getSupportedMimeType(),
        videoBitsPerSecond: 5000000, // 5 Mbps video bitrate for better quality
        audioBitsPerSecond: 128000   // 128 kbps audio bitrate
      };
      
      recorderRef.current = new MediaRecorder(combinedStream, options);
      
      // Handle data available event
      recorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
      recorderRef.current.onstop = () => {
        try {
          console.log(`Recording stopped with ${recordedChunksRef.current.length} chunks`);
          
          if (recordedChunksRef.current.length > 0) {
            const recordedBlob = new Blob(recordedChunksRef.current, { 
              type: getSupportedMimeType() || 'video/webm' 
            });
            console.log(`Created blob of size ${recordedBlob.size} bytes`);
            
            // Preview the recorded video silently to ensure it's valid
            const url = URL.createObjectURL(recordedBlob);
            const video = document.createElement('video');
            video.style.display = 'none';
            video.src = url;
            video.preload = 'metadata';
            
            // Wait for metadata to load to confirm video is valid
            video.onloadedmetadata = () => {
              URL.revokeObjectURL(url);
              document.body.removeChild(video);
              setRecordingBlob(recordedBlob);
              setIsProcessing(false);
              setRecordingReady(true);
              console.log(`Recording is valid: ${video.videoWidth}x${video.videoHeight}, duration: ${video.duration}s`);
            };
            
            video.onerror = () => {
              console.error('Recording validation failed - corrupted video');
              URL.revokeObjectURL(url);
              document.body.removeChild(video);
              setIsProcessing(false);
              alert('The recording may be corrupted. Please try again with different settings.');
            };
            
            document.body.appendChild(video);
          } else {
            console.error('No chunks recorded');
            setIsProcessing(false);
            alert('No data was recorded. Please try again.');
          }
        } catch (err) {
          console.error('Error processing recording:', err);
          setIsProcessing(false);
        }
        
        // Clean up temporary streams
        streamsRef.current.forEach(stream => {
          if (stream && stream.getTracks) {
            stream.getTracks().forEach(track => track.stop());
          }
        });
        
        // Close AudioContext and disconnect sources
        if (audioContextRef.current) {
          audioSourcesRef.current.forEach(source => {
            try {
              source.disconnect();
            } catch (err) {
              console.warn('Error disconnecting audio source:', err);
            }
          });
          
          try {
            audioContextRef.current.close();
          } catch (err) {
            console.warn('Error closing audio context:', err);
          }
        }
      };
      
      // Start recording with 1-second chunks for better responsiveness
      recorderRef.current.start(1000);
      
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert(`Could not start recording: ${error.message || 'Unknown error'}`);
      stopRecording();
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (!isRecording) return;
    
    setIsRecording(false);
    setIsProcessing(true);
    
    // Inform others that recording has stopped
    if (socket) {
      socket.emit('local-recording-stopped', roomId, myId);
    }
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stop recording
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.stop();
        console.log('Recording stopped');
      } catch (err) {
        console.error('Error stopping recorder:', err);
        setIsProcessing(false);
        setRecordingReady(!!recordedChunksRef.current.length);
      }
    } else {
      setIsProcessing(false);
      setRecordingReady(!!recordedChunksRef.current.length);
    }
    
    // Close AudioContext and disconnect sources
    if (audioContextRef.current) {
      audioSourcesRef.current.forEach(source => {
        try {
          source.disconnect();
        } catch (err) {
          console.warn('Error disconnecting audio source:', err);
        }
      });
      
      try {
        audioContextRef.current.close();
        audioContextRef.current = null;
      } catch (err) {
        console.warn('Error closing audio context:', err);
      }
    }
  };
  
  // Download recording
  const downloadRecording = () => {
    if (!recordingBlob) {
      alert('No recording available to download');
      return;
    }
    
    const timestamp = recordingStartTime
      ? recordingStartTime.toISOString().replace(/[:.]/g, '-')
      : new Date().toISOString().replace(/[:.]/g, '-');
      
    const filename = `meeting-recording-${roomId}-${timestamp}.webm`;
    
    // Create URL for the recording blob
    const url = URL.createObjectURL(recordingBlob);
    
    // Open the video in a new browser tab for preview
    const previewWindow = window.open('', '_blank');
    
    if (previewWindow) {
      // Create a simple HTML page to show the video with download button
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Meeting Recording - ${roomId}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f3f4f6;
                margin: 0;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 100vh;
              }
              h1 {
                color: #333;
                margin-bottom: 20px;
              }
              .video-container {
                max-width: 95%;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                padding: 20px;
                margin-bottom: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              video {
                max-width: 100%;
                border-radius: 4px;
              }
              .controls {
                display: flex;
                gap: 10px;
                margin-top: 15px;
              }
              button {
                background: #4f46e5;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
              }
              button:hover {
                background: #4338ca;
              }
              .info {
                font-size: 14px;
                color: #666;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <h1>Meeting Recording</h1>
            <div class="video-container">
              <video controls autoplay src="${url}"></video>
              <div class="info">
                <p>Recording of meeting in room: ${roomId}</p>
                <p>Date: ${new Date().toLocaleString()}</p>
                <p>Duration: ${formatTime(recordingTime)}</p>
              </div>
              <div class="controls">
                <button id="downloadBtn">Download Recording</button>
              </div>
            </div>
            <script>
              document.getElementById('downloadBtn').addEventListener('click', function() {
                const a = document.createElement('a');
                a.href = "${url}";
                a.download = "${filename}";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              });
            </script>
          </body>
        </html>
      `);
      previewWindow.document.close();
      
      // Clean up the URL when the preview window is closed
      previewWindow.addEventListener('beforeunload', () => {
        URL.revokeObjectURL(url);
      });
    } else {
      // Fallback to direct download if popup is blocked
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      a.click();
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    }
  };
  
  // Cancel recording and reset
  const cancelRecording = () => {
    // Stop recording if it's in progress
    if (isRecording) {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try {
          recorderRef.current.stop();
        } catch (err) {
          console.error('Error stopping recorder:', err);
        }
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Clean up temporary streams
      streamsRef.current.forEach(stream => {
        if (stream && stream.getTracks) {
          stream.getTracks().forEach(track => track.stop());
        }
      });
      
      // Close AudioContext and disconnect sources
      if (audioContextRef.current) {
        audioSourcesRef.current.forEach(source => {
          try {
            source.disconnect();
          } catch (err) {
            console.warn('Error disconnecting audio source:', err);
          }
        });
        
        try {
          audioContextRef.current.close();
          audioContextRef.current = null;
        } catch (err) {
          console.warn('Error closing audio context:', err);
        }
      }
    }
    
    // Reset state
    setIsRecording(false);
    setIsProcessing(false);
    setRecordingReady(false);
    setRecordingTime(0);
    setRecordingBlob(null);
    setRecordingStartTime(null);
    recordedChunksRef.current = [];
    audioSourcesRef.current = [];
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try {
          recorderRef.current.stop();
        } catch (error) {
          console.log('Error stopping media recorder:', error);
        }
      }
      
      // Clean up any streams
      streamsRef.current.forEach(stream => {
        if (stream && stream.getTracks) {
          stream.getTracks().forEach(track => track.stop());
        }
      });
      
      // Close AudioContext and disconnect sources
      if (audioContextRef.current) {
        audioSourcesRef.current.forEach(source => {
          try {
            source.disconnect();
          } catch (err) {
            console.warn('Error disconnecting audio source:', err);
          }
        });
        
        try {
          audioContextRef.current.close();
        } catch (err) {
          console.warn('Error closing audio context:', err);
        }
      }
    };
  }, []);

  return (
    <div className={styles.recorderContainer}>
      {/* Main button */}
      <div className={styles.controls}>
        {!isRecording && !isProcessing && !recordingReady && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={startRecording}
            className={styles.recordButton}
            title="Start video recording (captures the meeting screen with all participants' audio)"
          >
            <MdFiberManualRecord size={20} className={styles.controlIcon} />
            <span className={styles.buttonLabel}>Record</span>
          </motion.button>
        )}
        
        {isRecording && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={stopRecording}
            className={`${styles.recordButton} ${styles.recording}`}
            title="Stop recording and save video"
          >
            <MdStop size={20} className={styles.controlIcon} />
            <span className={styles.buttonLabel}>Stop</span>
          </motion.button>
        )}
        
        {isProcessing && (
          <motion.button
            className={`${styles.recordButton} ${styles.processing}`}
            disabled
            title="Processing your recording..."
          >
            <FaSpinner size={20} className={`${styles.controlIcon} ${styles.spinner}`} />
            <span className={styles.buttonLabel}>Processing</span>
          </motion.button>
        )}
        
        {recordingReady && (
          <>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={downloadRecording}
              className={`${styles.recordButton} ${styles.download}`}
              title="View and download your recording"
            >
              <MdDownload size={20} className={styles.controlIcon} />
              <span className={styles.buttonLabel}>Save</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={cancelRecording}
              className={`${styles.recordButton} ${styles.cancel}`}
              title="Delete recording and start a new one"
            >
              <MdDelete size={20} className={styles.controlIcon} />
              <span className={styles.buttonLabel}>New</span>
            </motion.button>
          </>
        )}
      </div>

      {/* Recording timer overlay */}
      {isRecording && (
        <div className={styles.recordingIndicator}>
          <div className={styles.recordingDot}></div>
          <span className={styles.recordingTimer}>{formatTime(recordingTime)}</span>
        </div>
      )}
      
      {/* User info tooltip */}
      {isRecording && (
        <div className={styles.recordingTooltip}>
          Recording meeting... All audio will be captured. Make sure speakers are unmuted.
        </div>
      )}
    </div>
  );
};

export default LocalRecorder;
