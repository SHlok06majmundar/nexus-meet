import ReactPlayer from "react-player";
import cx from "classnames";
import { Mic, MicOff, User, Pin, Fullscreen, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { FaHandPaper } from "react-icons/fa";

import styles from "@/component/Player/index.module.css";

const Player = (props) => {
  const { url, muted, playing, isActive, userName, isLocal, handRaised } = props;// Format username to handle both strings and user IDs
  const formatDisplayName = (name) => {
    if (!name) return "User";
    // If name looks like a user ID (contains numbers and special chars), use "User" instead
    if (/^[a-z0-9-]+$/.test(name) && name.length > 10) return "User";
    return name;
  };
  
  const displayName = formatDisplayName(userName);
  
  // Track when player is ready and if there were any errors
  const [isPlayerReady, setPlayerReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isControlsVisible, setControlsVisible] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const playerRef = useRef(null);
  
  // Reset error state whenever url or playing changes
  useEffect(() => {
    setHasError(false);
  }, [url, playing]);
  
  // Generate initial avatar letter
  const getInitial = () => {
    return displayName.charAt(0).toUpperCase();
  };
  
  // Log player state changes for debugging
  useEffect(() => {
    console.log(`Player state: ${displayName} - playing: ${playing}, muted: ${muted}`);
  }, [playing, muted, displayName]);
  
  // Toggle pin state
  const togglePin = (e) => {
    e.stopPropagation();
    setIsPinned(!isPinned);
    // TODO: Implement actual pinning logic via parent component
  };
  
  // Toggle mirror mode
  const toggleMirror = (e) => {
    e.stopPropagation();
    setIsMirrored(!isMirrored);
    
    // Apply mirror effect to video elements
    if (playerRef.current?.wrapper) {
      const videoElements = playerRef.current.wrapper.getElementsByTagName('video');
      if (videoElements && videoElements.length > 0) {
        for (let i = 0; i < videoElements.length; i++) {
          videoElements[i].style.transform = !isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
        }
      }
    }
  };
  
  // Show player controls on hover
  const showControls = () => {
    setControlsVisible(true);
  };
    // Hide player controls when hover ends
  const hideControls = () => {
    setControlsVisible(false);
  };
  // Apply video mirroring based on user preference
  useEffect(() => {
    // Skip if not a local video feed or player ref not available
    if (!isLocal || !playerRef.current) return;
    
    const applyVideoSettings = () => {
      try {
        if (!playerRef.current?.wrapper) return;
        
        // Get video elements safely
        const videoElements = playerRef.current.wrapper.getElementsByTagName('video');
        if (!videoElements || videoElements.length === 0) return;
        
        console.log(`Configuring video elements (${videoElements.length}): mirrored=${isMirrored}`);
        
        // Apply mirroring based on user preference
        for (let i = 0; i < videoElements.length; i++) {
          videoElements[i].style.transform = isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
        }
      } catch (err) {
        console.error("Error configuring video elements:", err);
      }
    };
    
    // Set a timeout to allow ReactPlayer to fully initialize
    const timeoutId = setTimeout(applyVideoSettings, 300);
      return () => {
      clearTimeout(timeoutId);
    };
  }, [isLocal, isMirrored]);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cx(styles.playerContainer, {
        [styles.notActive]: !isActive,
        [styles.active]: isActive,
        [styles.notPlaying]: !playing,
        [styles.localParticipant]: isLocal,
        [styles.pinned]: isPinned
      })}
      onMouseEnter={showControls}
      onMouseLeave={hideControls}
    >
      {/* Only render ReactPlayer when we have a URL */}
      {url && (        <ReactPlayer
          ref={playerRef}
          url={url}
          muted={muted}
          playing={true}  // Always keep playing for audio
          width="100%"
          height="100%"
          style={{ 
            display: playing ? 'block' : 'none'
          }}
          onReady={() => {
            console.log(`Player ready: ${displayName}`);
            setPlayerReady(true);
          }}
          onError={(e) => {
            console.error(`Player error: ${displayName}`, e);
            setHasError(true);
          }}
          config={{
            file: {
              forceVideo: true
            },
          }}
        />
      )}
      
      {/* Overlay shown when video is not playing (camera off) */}
      {!playing && (
        <div className={styles.avatarOverlay}>
          <div className={styles.avatarCircle}>
            {getInitial()}
          </div>
        </div>
      )}
      
      {/* Hand raised indicator */}
      {handRaised && (
        <div className={styles.handRaisedIndicator}>
          <FaHandPaper className={styles.handIcon} />
        </div>
      )}
      
      {/* Google Meet style info bar at bottom */}
      <div className={styles.playerInfoBar}>
        {/* Mic status indicator */}
        <div className={styles.micStatus}>
          {muted ? (
            <MicOff size={16} className={styles.micIcon} />
          ) : (
            <Mic size={16} className={styles.micIcon} />
          )}
        </div>
        
        {/* Participant name */}
        <div className={styles.participantName}>
          {isLocal ? `${displayName} (You)` : displayName}
        </div>
      </div>
      
      {/* Video controls that appear on hover */}
      <motion.div 
        className={styles.videoControls}
        initial={{ opacity: 0 }}
        animate={{ opacity: isControlsVisible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className={styles.controlButton} onClick={togglePin}>
          <Pin size={16} className={cx(styles.controlIcon, { [styles.active]: isPinned })} />
        </div>
        
        <div className={styles.controlButton}>
          <Fullscreen size={16} className={styles.controlIcon} />
        </div>
        
        <div className={styles.controlButton}>
          <MoreVertical size={16} className={styles.controlIcon} />
        </div>
          {/* Mirror toggle button - only for local video */}
        {isLocal && (
          <div 
            className={styles.controlButton} 
            onClick={toggleMirror}
            title={isMirrored ? "Disable mirroring" : "Enable mirroring"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cx(styles.controlIcon, { [styles.active]: isMirrored })}>
              <rect x="2" y="3" width="8" height="18" />
              <path d="M12 12h.01" />
              <rect x="14" y="3" width="8" height="18" />
              <path d="M12 3v18" />            </svg>
          </div>
        )}
      </motion.div>
      
      {/* Audio meter (animation if speaking) */}
      {!muted && (
        <div className={styles.audioMeterContainer}>
          <div className={styles.audioMeter}></div>
        </div>
      )}
    </motion.div>
  );
};

export default Player;
