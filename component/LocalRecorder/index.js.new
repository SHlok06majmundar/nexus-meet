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
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const socket = useSocket();
  
  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start recording
  const startRecording = async () => {
    try {
      setIsRecording(true);
      setRecordingReady(false);
      setRecordingBlob(null);
      setRecordingStartTime(new Date());
      recordedChunksRef.current = [];
      streamsRef.current = [];
      
      // Inform others that recording has started
      if (socket) {
        socket.emit('local-recording-started', roomId, myId);
      }
      
      // Initialize timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Find all video elements on the page to capture
      let videoStreamPromise;
      
      // First attempt: try HTML5 canvas-based composition of all video elements
      try {
        const allVideos = document.querySelectorAll('video');
        console.log(`Found ${allVideos.length} video elements on page`);
        
        if (allVideos.length > 0) {
          // Set up canvas for compositing
          const canvas = document.createElement('canvas');
          canvasRef.current = canvas;
          canvas.width = 1280;  // HD resolution
          canvas.height = 720;
          document.body.appendChild(canvas);
          canvas.style.position = 'fixed';
          canvas.style.top = '-9999px'; // Hide off-screen
          
          const ctx = canvas.getContext('2d');
          
          // Start canvas capture
          const canvasStream = canvas.captureStream(30); // 30fps
          
          // Add audio tracks from all participants
          // First add my own audio if available
          if (myStream && myStream.getAudioTracks().length > 0) {
            try {
              canvasStream.addTrack(myStream.getAudioTracks()[0]);
              console.log('Added local audio track to recording');
            } catch (e) {
              console.warn('Could not add local audio track:', e);
            }
          }
          
          // Then try to add audio from other participants (take first audio track from each)
          Object.values(players || {}).forEach(player => {
            if (player.stream && player.stream.getAudioTracks().length > 0) {
              try {
                canvasStream.addTrack(player.stream.getAudioTracks()[0]);
                console.log('Added remote participant audio track to recording');
              } catch (e) {
                console.warn('Could not add audio track from participant:', e);
              }
            }
          });
          
          // Start the rendering loop
          const renderLoop = () => {
            ctx.fillStyle = '#1a1a1a'; // Dark background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Calculate grid layout
            const totalVideos = allVideos.length;
            let cols = Math.ceil(Math.sqrt(totalVideos));
            let rows = Math.ceil(totalVideos / cols);
            
            // Adjust if we have few videos to make them larger
            if (totalVideos <= 4) {
              cols = totalVideos <= 2 ? totalVideos : 2;
              rows = Math.ceil(totalVideos / cols);
            }
            
            const cellWidth = canvas.width / cols;
            const cellHeight = canvas.height / rows;
            
            // Draw videos to canvas
            allVideos.forEach((video, index) => {
              if (video.readyState >= 2) { // HAVE_CURRENT_DATA or better
                const row = Math.floor(index / cols);
                const col = index % cols;
                const x = col * cellWidth;
                const y = row * cellHeight;
                
                ctx.drawImage(video, x, y, cellWidth, cellHeight);
              }
            });
            
            if (recorderRef.current && recorderRef.current.state === 'recording') {
              animationRef.current = requestAnimationFrame(renderLoop);
            } else {
              // Clean up when done
              if (document.body.contains(canvas)) {
                document.body.removeChild(canvas);
              }
            }
          };
          
          animationRef.current = requestAnimationFrame(renderLoop);
          videoStreamPromise = Promise.resolve(canvasStream);
          console.log('Using canvas-based compositing for video recording');
        }
      } catch (err) {
        console.warn('Canvas compositing failed:', err);
      }
      
      // Second attempt: try capturing the video grid directly
      if (!videoStreamPromise) {
        try {
          const videoGrid = document.querySelector('#videoGrid') || 
                            document.querySelector('.videoGrid') || 
                            document.querySelector('[class*="videoGrid"]');
          
          if (videoGrid) {
            console.log('Found video grid element, attempting to capture it');
            if (videoGrid.captureStream) {
              videoStreamPromise = Promise.resolve(videoGrid.captureStream(30)); // 30fps
            } else {
              console.log('captureStream not supported on video grid, falling back to display capture');
              videoStreamPromise = navigator.mediaDevices.getDisplayMedia({
                video: {
                  cursor: "never",
                  displaySurface: "browser"
                },
                audio: true,
                preferCurrentTab: true, // Chrome supports this
                selfBrowserSurface: "include", // Firefox supports this
                surfaceSwitching: "exclude",
                systemAudio: "include"
              });
            }
          }
        } catch (err) {
          console.warn('Failed to capture video grid directly:', err);
        }
      }
      
      // Third attempt: If grid capture failed, try to get all streams individually
      if (!videoStreamPromise) {
        console.log('Falling back to individual stream capture method');
        const streamsToRecord = [];
        
        // Add local stream if available
        if (myStream) {
          streamsToRecord.push(myStream);
          console.log('Added local stream to recording');
        }
        
        // Try to get remote streams from other participants
        let participantCount = 0;
        Object.entries(players || {}).forEach(([playerId, player]) => {
          if (playerId !== myId && player.stream) {
            streamsToRecord.push(player.stream);
            participantCount++;
            console.log(`Added remote participant ${playerId} stream to recording`);
          }
        });
        
        console.log(`Found ${participantCount} remote participants with streams`);
        
        // If we have streams, use them, otherwise fallback to screen capture
        if (streamsToRecord.length > 0) {
          // Get a MediaStream with all video tracks
          const combinedStream = new MediaStream();
          
          // Add all audio and video tracks to the combined stream
          const audioTracks = [];
          const videoTracks = [];
          
          // Collect all tracks
          streamsToRecord.forEach(stream => {
            if (stream && stream.getTracks) {
              stream.getAudioTracks().forEach(track => audioTracks.push(track));
              stream.getVideoTracks().forEach(track => videoTracks.push(track));
            }
          });
          
          // Add all audio tracks
          audioTracks.forEach(track => {
            try {
              combinedStream.addTrack(track);
            } catch (e) {
              console.warn('Could not add audio track:', e);
            }
          });
          
          // Add all video tracks - in case browser supports multiple video tracks
          videoTracks.forEach((track, index) => {
            try {
              combinedStream.addTrack(track);
              console.log(`Added video track ${index + 1} of ${videoTracks.length}`);
            } catch (e) {
              // Some browsers only allow one video track per stream
              if (index === 0) {
                console.warn('Could not add video track:', e);
              }
            }
          });
          
          videoStreamPromise = Promise.resolve(combinedStream);
          console.log(`Combined ${audioTracks.length} audio tracks and ${videoTracks.length} video tracks`);
        }
      }
      
      // Final attempt: If all else fails, fall back to screen capture
      if (!videoStreamPromise) {
        console.log('No streams available, falling back to screen capture');
        videoStreamPromise = navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
      }
      
      // Get the video stream
      const videoStream = await videoStreamPromise;
      streamsRef.current.push(videoStream);
      
      // If we don't have any audio tracks, try to get system audio or local mic audio
      const hasAudioTrack = videoStream.getAudioTracks().length > 0;
      
      if (!hasAudioTrack) {
        console.log('No audio tracks detected, attempting to add audio');
        try {
          // Try to get user audio
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamsRef.current.push(audioStream);
          
          // Add audio tracks to video stream
          audioStream.getAudioTracks().forEach(track => {
            try {
              videoStream.addTrack(track);
              console.log('Successfully added microphone audio to recording');
            } catch (e) {
              console.warn('Could not add audio track to stream:', e);
            }
          });
        } catch (audioErr) {
          console.warn('Could not add microphone audio:', audioErr);
        }
      }
      
      // Check if we have any tracks to record
      if (videoStream.getTracks().length === 0) {
        alert('No media tracks available for recording. Please ensure cameras or microphones are enabled.');
        stopRecording();
        return;
      }
      
      console.log(`Starting recording with ${videoStream.getVideoTracks().length} video tracks and ${videoStream.getAudioTracks().length} audio tracks`);
      
      // Create MediaRecorder with best available options
      const options = { 
        mimeType: getSupportedMimeType(),
        videoBitsPerSecond: 3000000, // 3 Mbps video bitrate
        audioBitsPerSecond: 128000   // 128 kbps audio bitrate
      };
      
      try {
        recorderRef.current = new MediaRecorder(videoStream, options);
        
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
          
          // Clean up temporary streams (like display media)
          streamsRef.current.forEach(stream => {
            if (stream && stream.getTracks) {
              stream.getTracks().forEach(track => track.stop());
            }
          });
          
          // Cancel any animation frames
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
          }
          
          // Remove canvas element if it exists
          if (canvasRef.current && document.body.contains(canvasRef.current)) {
            document.body.removeChild(canvasRef.current);
            canvasRef.current = null;
          }
        };
        
        // Start recording with 1-second chunks
        recorderRef.current.start(1000);
        
        console.log('Recording started successfully');
      } catch (err) {
        console.error('Error starting MediaRecorder:', err);
        alert(`Could not start recorder: ${err.message}. Try using a different browser.`);
        stopRecording();
      }
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert(`Could not start recording: ${error.message || 'Unknown error'}`);
      stopRecording();
    }
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
    
    // Cancel any animation frames
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Remove canvas element if it exists
    if (canvasRef.current && document.body.contains(canvasRef.current)) {
      document.body.removeChild(canvasRef.current);
      canvasRef.current = null;
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
      
      // Cancel any animation frames
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Remove canvas element if it exists
      if (canvasRef.current && document.body.contains(canvasRef.current)) {
        document.body.removeChild(canvasRef.current);
        canvasRef.current = null;
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
      
      // Cancel any animation frames
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Remove canvas element if it exists
      if (canvasRef.current && document.body.contains(canvasRef.current)) {
        document.body.removeChild(canvasRef.current);
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
            title="Start video recording (captures all participants)"
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
          Recording all participants...
        </div>
      )}
    </div>
  );
};

export default LocalRecorder;
