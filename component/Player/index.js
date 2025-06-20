import ReactPlayer from "react-player";
import cx from "classnames";
import { Mic, MicOff, Camera, CameraOff } from "lucide-react";
import { motion } from "framer-motion";

import styles from "@/component/Player/index.module.css";

const Player = (props) => {
  const { url, muted, playing, isActive, userName = "User" } = props;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cx(styles.playerContainer, {
        [styles.notActive]: !isActive,
        [styles.active]: isActive,
        [styles.notPlaying]: !playing,
      })}
    >
      {playing ? (
        <ReactPlayer
          url={url}
          muted={muted}
          playing={playing}
          width="100%"
          height="100%"
          config={{
            file: {
              attributes: {
                style: {
                  objectFit: 'cover',
                  borderRadius: isActive ? '0.75rem' : '0.5rem',
                }
              }
            }
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-accent bg-opacity-30 flex items-center justify-center">
            <span className="text-2xl md:text-4xl font-medium text-accent">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <span className="mt-4 text-sm font-medium text-lightText">{userName}</span>
          <span className="mt-1 text-xs text-lightText opacity-60">Camera off</span>
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex gap-2">
        {muted ? (
          <div className="p-1.5 bg-danger bg-opacity-70 backdrop-blur-sm rounded-full">
            <MicOff className="text-white" size={18} />
          </div>
        ) : (
          <div className="p-1.5 bg-highlight bg-opacity-70 backdrop-blur-sm rounded-full">
            <Mic className="text-white" size={18} />
          </div>
        )}
        
        {!playing && (
          <div className="p-1.5 bg-danger bg-opacity-70 backdrop-blur-sm rounded-full">
            <CameraOff className="text-white" size={18} />
          </div>
        )}
      </div>
      
      {!isActive && <span className={styles.playerName}>{userName}</span>}
    </motion.div>
  );
};

export default Player;
