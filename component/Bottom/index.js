import cx from "classnames";
import {
  Mic,
  Video,
  PhoneOff,
  MicOff,
  VideoOff,
  MessageSquare,
} from "lucide-react";

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

  return (
    <div className={styles.bottomMenu}>
      {muted ? (
        <MicOff
          className={cx(styles.icon, styles.active)}
          size={55}
          onClick={toggleAudio}
        />
      ) : (
        <Mic className={styles.icon} size={55} onClick={toggleAudio} />
      )}
      {playing ? (
        <Video className={styles.icon} size={55} onClick={toggleVideo} />
      ) : (
        <VideoOff
          className={cx(styles.icon, styles.active)}
          size={55}
          onClick={toggleVideo}
        />
      )}
      <MessageSquare
        className={cx(styles.icon, isChatOpen && styles.active)}
        size={55}
        onClick={toggleChat}
      />
      <PhoneOff size={55} className={cx(styles.icon)} onClick={leaveRoom} />
    </div>
  );
};

export default Bottom;
