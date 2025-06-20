import ReactPlayer from "react-player";
import cx from "classnames";
import { Mic, MicOff, UserSquare2 } from "lucide-react";

import styles from "@/component/Player/index.module.css";

const Player = (props) => {
  const { url, muted, playing, isActive } = props;
  return (
    <div
      className={cx(styles.playerContainer, {
        [styles.notActive]: !isActive,
        [styles.active]: isActive,
        [styles.notPlaying]: !playing,
      })}
    >
      {/* Always render ReactPlayer for audio but hide it when video is off */}
      <ReactPlayer
        url={url}
        muted={muted}
        playing={true}  // Always keep playing for audio
        width="100%"
        height="100%"
        style={{ display: playing ? 'block' : 'none' }}  // Hide video when not playing
      />
      
      {/* Show user icon when video is off */}
      {!playing && (
        <UserSquare2 className={styles.user} size={isActive ? 400 : 150} />
      )}

      {!isActive ? (
        muted ? (
          <MicOff className={styles.icon} size={20} />
        ) : (
          <Mic className={styles.icon} size={20} />
        )
      ) : undefined}
    </div>
  );
};

export default Player;
