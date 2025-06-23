import { useState } from "react";
import cx from "classnames";
import { 
  Mic, 
  Video, 
  PhoneOff, 
  MicOff, 
  VideoOff, 
  Smile, 
  ScreenShare, 
  Shield,
  MoreHorizontal,
  MessageSquare,
  Settings,
  Users,
  BarChart
} from "lucide-react";
import { motion } from "framer-motion";

import styles from "@/component/Bottom/index.module.css";
import AIRecorder from "@/component/AIRecorder";
import LocalRecorder from "@/component/LocalRecorder";

const Bottom = (props) => {
  const { 
    muted,
    playing,
    toggleAudio, 
    toggleVideo, 
    leaveRoom, 
    togglePeopleTab, 
    toggleChat, 
    toggleActivities, 
    roomId, 
    players, 
    myId, 
    myStream  // Get the user's media stream for recording
  } = props;
  // Debounce flags for controls to prevent rapid clicking
  const [isVideoButtonDisabled, setVideoButtonDisabled] = useState(false);
  const [isAudioButtonDisabled, setAudioButtonDisabled] = useState(false);
  
  // Function to share the current screen
  const shareScreen = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia({ video: true })
        .then((stream) => {
          // Find the existing video track and replace it
          const videoTrack = stream.getVideoTracks()[0];
          
          // Dispatch an event that the socket context can listen to
          const screenShareEvent = new CustomEvent('screen-share-started', { 
            detail: { stream, videoTrack } 
          });
          window.dispatchEvent(screenShareEvent);
        })
        .catch((err) => {
          console.error("Error sharing screen:", err);
          alert("Could not share screen: " + err.message);
        });
    } else {
      alert("Your browser doesn't support screen sharing");
    }
  };
  
  // Function to show emoji reactions
  const [showReactions, setShowReactions] = useState(false);
  
  const toggleReactions = () => {
    setShowReactions(!showReactions);
  };
  
  // Handle control button clicks with debounce
  const handleToggleAudio = () => {
    if (isAudioButtonDisabled) return;
    
    setAudioButtonDisabled(true);
    toggleAudio();
    
    // Re-enable button after a short delay
    setTimeout(() => {
      setAudioButtonDisabled(false);
    }, 500);
  };
  
  const handleToggleVideo = () => {
    if (isVideoButtonDisabled) return;
    
    setVideoButtonDisabled(true);
    toggleVideo();
    
    // Re-enable button after a short delay
    setTimeout(() => {
      setVideoButtonDisabled(false);
    }, 500);
  };
  
  // Motion variants for animations
  const controlButtonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };
  
  const dangerButtonVariants = {
    hover: { scale: 1.05, backgroundColor: "#ea4335" },
    tap: { scale: 0.95 }
  };

  return (
    <div className={styles.controlsWrapper}>
      {/* Primary Controls - Google Meet Style */}
      <div className={styles.primaryControls}>
        {/* Mic Button */}
        <motion.button
          variants={controlButtonVariants}
          whileHover="hover"
          whileTap="tap"
          transition={{ duration: 0.1 }}
          className={cx(styles.controlButton, {
            [styles.active]: !muted
          })}
          onClick={handleToggleAudio}
          disabled={isAudioButtonDisabled}
          aria-label={muted ? "Unmute microphone" : "Mute microphone"}
        >
          {muted ? (
            <>
              <MicOff className={styles.controlIcon} />
              <span className={styles.buttonLabel}>Unmute</span>
            </>
          ) : (
            <>
              <Mic className={styles.controlIcon} />
              <span className={styles.buttonLabel}>Mute</span>
            </>
          )}
        </motion.button>

        {/* Video Button */}
        <motion.button
          variants={controlButtonVariants}
          whileHover="hover"
          whileTap="tap"
          transition={{ duration: 0.1 }}
          className={cx(styles.controlButton, {
            [styles.active]: playing
          })}
          onClick={handleToggleVideo}
          disabled={isVideoButtonDisabled}
          aria-label={playing ? "Turn off camera" : "Turn on camera"}
        >
          {playing ? (
            <>
              <Video className={styles.controlIcon} />
              <span className={styles.buttonLabel}>Stop</span>
            </>
          ) : (
            <>
              <VideoOff className={styles.controlIcon} />
              <span className={styles.buttonLabel}>Start</span>
            </>
          )}
        </motion.button>
          {/* Screen Share Button */}
        <motion.button
          variants={controlButtonVariants}
          whileHover="hover"
          whileTap="tap"
          transition={{ duration: 0.1 }}
          className={styles.controlButton}
          onClick={shareScreen}
          aria-label="Share screen"
        >
          <ScreenShare className={styles.controlIcon} />
          <span className={styles.buttonLabel}>Present</span>
        </motion.button>
        
        {/* Local Video Recorder Button */}
        {roomId && players && myId && (
          <motion.div
            className={styles.recorderButtonContainer}
            variants={controlButtonVariants}
            whileHover="hover"
            transition={{ duration: 0.1 }}
          >
            <LocalRecorder roomId={roomId} players={players} myId={myId} myStream={props.myStream} />
          </motion.div>
        )}

        {/* AI Recorder Button */}
        {roomId && players && myId && (
          <motion.div
            className={styles.aiButtonContainer}
            variants={controlButtonVariants}
            whileHover="hover"
            transition={{ duration: 0.1 }}
          >
            <AIRecorder roomId={roomId} players={players} myId={myId} />
          </motion.div>
        )}
      </div>

      {/* End Call Button - Google Meet Style Red Button */}
      <motion.button
        variants={dangerButtonVariants}
        whileHover="hover"
        whileTap="tap"
        transition={{ duration: 0.1 }}
        className={styles.leaveButton}
        onClick={leaveRoom}
        aria-label="Leave call"
      >
        <PhoneOff className={styles.leaveIcon} />
      </motion.button>
      
      {/* Secondary Controls */}
      <div className={styles.secondaryControls}>
        {/* Chat Button */}
        {toggleChat && (
          <motion.button
            variants={controlButtonVariants}
            whileHover="hover"
            whileTap="tap"
            transition={{ duration: 0.1 }}
            className={styles.controlButton}
            onClick={toggleChat}
            aria-label="Open chat"
          >
            <MessageSquare className={styles.controlIcon} />
            <span className={styles.buttonLabel}>Chat</span>
          </motion.button>
        )}
        
        {/* People Button */}
        {togglePeopleTab && (
          <motion.button
            variants={controlButtonVariants}
            whileHover="hover"
            whileTap="tap"
            transition={{ duration: 0.1 }}
            className={styles.controlButton}
            onClick={togglePeopleTab}
            aria-label="Show participants"
          >
            <Users className={styles.controlIcon} />
            <span className={styles.buttonLabel}>People</span>
          </motion.button>
        )}
        
        {/* Activities Button */}
        {toggleActivities && (
          <motion.button
            variants={controlButtonVariants}
            whileHover="hover"
            whileTap="tap"
            transition={{ duration: 0.1 }}
            className={styles.controlButton}
            onClick={toggleActivities}
            aria-label="Activities"
          >
            <BarChart className={styles.controlIcon} />
            <span className={styles.buttonLabel}>Activities</span>
          </motion.button>
        )}
        
        {/* Reactions Button */}
        <motion.div className={styles.reactionsWrapper}>
          <motion.button
            variants={controlButtonVariants}
            whileHover="hover"
            whileTap="tap"
            transition={{ duration: 0.1 }}
            className={cx(styles.controlButton, {
              [styles.active]: showReactions
            })}
            onClick={toggleReactions}
            aria-label="Show reactions"
          >
            <Smile className={styles.controlIcon} />
            <span className={styles.buttonLabel}>Reactions</span>
          </motion.button>
          
          {/* Emoji reactions panel */}
          {showReactions && (
            <div className={styles.reactionsPanel}>
              {['👍', '👏', '❤️', '😂', '😮', '😢'].map((emoji) => (
                <button
                  key={emoji}
                  className={styles.reactionButton}
                  onClick={() => {                    // Create a custom event for the emoji reaction
                    const emojiEvent = new CustomEvent('send-reaction', {
                      detail: { emoji }
                    });
                    window.dispatchEvent(emojiEvent);
                    setShowReactions(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Emoji Reactions Container */}
      {showReactions && <div className={styles.backdropOverlay} onClick={toggleReactions} />}
    </div>
  );
};

export default Bottom;
