import cx from "classnames";
import {
  Mic,
  Video,
  PhoneOff,
  MicOff,
  VideoOff,
  MessageSquare,
  Share,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import styles from "@/component/Bottom/index.module.css";

const Bottom = (props) => {
  const {
    muted,
    playing,
    toggleAudio,
    toggleVideo,
    leaveRoom,
    toggleChat,
    isChatOpen,
  } = props;
  
  const router = useRouter();
  const [isSharing, setIsSharing] = useState(false);
  
  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Meeting link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy meeting link');
    }
  };

  return (
    <motion.div 
      className={styles.bottomMenu}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className={styles.controlsWrapper}>        <div 
          className={cx(styles.icon, styles.audioIcon, {
            [styles.muted]: muted,
          })}
          onClick={toggleAudio}
        >
          {!muted ? <Mic size={24} /> : <MicOff size={24} />}
        </div>        <div
          className={cx(styles.icon, styles.videoIcon, {
            [styles.off]: !playing,
          })}
          onClick={toggleVideo}
        >
          {playing ? <Video size={24} /> : <VideoOff size={24} />}
        </div>

        <div
          className={cx(styles.icon, styles.chatIcon, {
            [styles.active]: isChatOpen,
          })}
          onClick={toggleChat}
        >
          <MessageSquare size={24} />
        </div>
        
        <div
          className={cx(styles.icon, "bg-secondary hover:bg-gray-700")}
          onClick={handleShareLink}
        >
          <Share size={24} />
        </div>
        
        <div
          className={cx(styles.icon, styles.leaveIcon)}
          onClick={leaveRoom}
        >
          <PhoneOff size={24} />
        </div>
      </div>
    </motion.div>
  );
};

export default Bottom;
