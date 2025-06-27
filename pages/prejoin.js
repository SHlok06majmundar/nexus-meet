import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useUser } from "@clerk/nextjs";
import { Video, Mic, MicOff, VideoOff, UserPlus, ArrowRight } from 'lucide-react';
import styles from "@/styles/prejoin.module.css";

export default function PreJoin() {
  const router = useRouter();
  const { roomId } = router.query;
  const { user, isSignedIn, isLoaded } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push({
        pathname: '/sign-in',
        query: { redirect_url: `/prejoin?roomId=${roomId}` }
      });
    }
  }, [isLoaded, isSignedIn, router, roomId]);

  // Set initial display name when user data is loaded
  useEffect(() => {
    if (isLoaded && user) {
      setDisplayName(user.fullName || user.username || '');
    }
  }, [isLoaded, user]);

  // Initialize camera preview when component mounts
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: isVideoEnabled,
          audio: isAudioEnabled
        });
        
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
        setIsVideoEnabled(false);
      }
    };

    initializeMedia();

    // Cleanup function to stop all tracks when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Toggle video
  const toggleVideo = async () => {
    const newState = !isVideoEnabled;
    setIsVideoEnabled(newState);
    
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = newState;
      });

      // If we're turning video back on after it was off, we might need to reinitialize
      if (newState && stream.getVideoTracks().length === 0) {
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
          const videoTrack = newStream.getVideoTracks()[0];
          stream.addTrack(videoTrack);
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error re-enabling video:', error);
          setIsVideoEnabled(false);
        }
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = newState;
      });
    }
  };
  // Join the meeting room with user preferences
  const joinMeeting = () => {
    if (!roomId) {
      alert('Room ID is missing. Please try again.');
      return;
    }

    // Stop tracks before navigating
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    setIsJoining(true);
    
    // Store user preferences in session storage
    sessionStorage.setItem('meetingPreferences', JSON.stringify({
      displayName: displayName.trim() || 'Guest',
      isVideoEnabled,
      isAudioEnabled
    }));
    
    // Add a flag to indicate we're coming from prejoin
    // This helps prevent redirect loops
    sessionStorage.setItem('comingFromPrejoin', 'true');

    // Navigate to the room
    router.push(`/${roomId}`);
  };

  if (!roomId) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.prejoinContainer}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>Ready to join?</h1>

        <div className={styles.videoPreviewContainer}>
          {isVideoEnabled ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={styles.videoPreview}
              style={{ transform: 'scaleX(-1)' }} // Mirror the preview video
            />
          ) : (
            <div className={styles.videoPlaceholder}>
              <div className={styles.avatarCircle}>
                {displayName ? displayName.charAt(0).toUpperCase() : 'G'}
              </div>
            </div>
          )}
          
          <div className={styles.mediaControls}>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={toggleAudio}
              className={`${styles.controlButton} ${!isAudioEnabled ? styles.disabled : ''}`}
              aria-label={isAudioEnabled ? 'Disable microphone' : 'Enable microphone'}
            >
              {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </motion.button>
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={toggleVideo}
              className={`${styles.controlButton} ${!isVideoEnabled ? styles.disabled : ''}`}
              aria-label={isVideoEnabled ? 'Disable camera' : 'Enable camera'}
            >
              {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </motion.button>
          </div>
        </div>

        <div className={styles.userInfoForm}>
          <div className={styles.formGroup}>
            <label htmlFor="displayName" className={styles.label}>Display Name</label>
            <input 
              id="displayName"
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              placeholder="Enter your name"
              className={styles.input}
              maxLength={50}
            />
          </div>

          <div className={styles.meetingInfo}>
            <div className={styles.roomIdDisplay}>
              <div className={styles.roomLabel}>Meeting ID:</div>
              <div className={styles.roomId}>{roomId}</div>
            </div>
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.97 }}
            onClick={joinMeeting}
            disabled={isJoining}
            className={styles.joinButton}
          >
            {isJoining ? 'Joining...' : 'Join Meeting'}
            {!isJoining && <ArrowRight size={18} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
