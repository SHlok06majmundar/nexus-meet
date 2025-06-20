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
  Shield
} from "lucide-react";
import { motion } from "framer-motion";

import styles from "@/component/Bottom/index.module.css";

const Bottom = (props) => {
  const { muted, playing, toggleAudio, toggleVideo, leaveRoom } = props;
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
  
  // Function to send a reaction
  const sendReaction = (emoji) => {
    // Create a custom event that the socket context can handle
    const reactionEvent = new CustomEvent('send-reaction', { 
      detail: { emoji } 
    });
    window.dispatchEvent(reactionEvent);
    setShowReactions(false);
  };

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className={styles.bottomMenu}
    >
      {/* Audio Button with tooltip */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={styles.buttonWrapper}
      >
        <div className={styles.tooltip}>{muted ? "Unmute" : "Mute"}</div>
        {muted ? (
          <MicOff
            className={cx(styles.icon, styles.active)}
            size={24}
            onClick={toggleAudio}
            strokeWidth={1.5}
          />
        ) : (
          <Mic 
            className={styles.icon} 
            size={24} 
            onClick={toggleAudio}
            strokeWidth={1.5} 
          />
        )}
      </motion.div>

      {/* Video Button with tooltip */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={styles.buttonWrapper}
      >
        <div className={styles.tooltip}>{playing ? "Stop Video" : "Start Video"}</div>
        {playing ? (
          <Video 
            className={styles.icon} 
            size={24} 
            onClick={toggleVideo}
            strokeWidth={1.5}
          />
        ) : (
          <VideoOff
            className={cx(styles.icon, styles.active)}
            size={24}
            onClick={toggleVideo}
            strokeWidth={1.5}
          />
        )}
      </motion.div>
        {/* Reactions Button with tooltip */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={styles.buttonWrapper}
      >
        <div className={styles.tooltip}>Reactions</div>
        <Smile 
          className={styles.icon} 
          size={24} 
          onClick={toggleReactions}
          strokeWidth={1.5}
        />
        
        {/* Reactions Panel */}
        {showReactions && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={styles.reactionsPanel}
          >
            <div className={styles.reactionsTitle}>Quick Reactions</div>
            <div className={styles.reactionsList}>
              <motion.div 
                whileHover={{ scale: 1.2 }} 
                whileTap={{ scale: 0.9 }}
                className={styles.reactionButton} 
                onClick={() => sendReaction('👍')}
              >
                👍
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.2 }} 
                whileTap={{ scale: 0.9 }}
                className={styles.reactionButton} 
                onClick={() => sendReaction('👏')}
              >
                👏
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.2 }} 
                whileTap={{ scale: 0.9 }}
                className={styles.reactionButton} 
                onClick={() => sendReaction('❤️')}
              >
                ❤️
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.2 }} 
                whileTap={{ scale: 0.9 }}
                className={styles.reactionButton} 
                onClick={() => sendReaction('🎉')}
              >
                🎉
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.2 }} 
                whileTap={{ scale: 0.9 }}
                className={styles.reactionButton} 
                onClick={() => sendReaction('😂')}
              >
                😂
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.2 }} 
                whileTap={{ scale: 0.9 }}
                className={styles.reactionButton} 
                onClick={() => sendReaction('🙌')}
              >
                🙌
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Share Screen Button with tooltip */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={styles.buttonWrapper}
      >
        <div className={styles.tooltip}>Share Screen</div>
        <ScreenShare 
          className={styles.icon} 
          size={24} 
          onClick={shareScreen}
          strokeWidth={1.5}
        />
      </motion.div>

      {/* End Call Button with tooltip */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={cx(styles.buttonWrapper, styles.endCallWrapper)}
      >
        <div className={styles.tooltip}>Leave Meeting</div>
        <PhoneOff 
          size={24} 
          className={cx(styles.icon, styles.endCall)} 
          onClick={leaveRoom}
          strokeWidth={1.5}
        />
      </motion.div>
    </motion.div>
  );
};

export default Bottom;
