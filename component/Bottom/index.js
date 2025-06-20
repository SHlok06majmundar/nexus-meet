import cx from "classnames";
import { 
  Mic, 
  Video, 
  PhoneOff, 
  MicOff, 
  VideoOff, 
  MessageSquare, 
  ScreenShare, 
  Shield
} from "lucide-react";
import { motion } from "framer-motion";

import styles from "@/component/Bottom/index.module.css";

const Bottom = (props) => {
  const { muted, playing, toggleAudio, toggleVideo, leaveRoom } = props;

  // Function to share the current screen (could be integrated with meeting functionality)
  const shareScreen = () => {
    // This is a placeholder - you would implement actual screen sharing logic
    alert("Screen sharing functionality would be implemented here");
  };
  
  // Function to open chat (placeholder)
  const openChat = () => {
    alert("Chat functionality would be implemented here");
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
      
      {/* Chat Button with tooltip */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={styles.buttonWrapper}
      >
        <div className={styles.tooltip}>Open Chat</div>
        <MessageSquare 
          className={styles.icon} 
          size={24} 
          onClick={openChat}
          strokeWidth={1.5}
        />
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
