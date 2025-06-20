import ReactPlayer from "react-player";
import cx from "classnames";
import { Mic, MicOff, User, GitBranch, Hexagon } from "lucide-react";
import { motion } from "framer-motion";

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
      
      {/* Show futuristic user icon when video is off */}
      {!playing && (
        <div className={styles.userIconContainer}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              rotate: [0, 10, 0, -10, 0],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className={styles.userIconWrapper}
          >
            <Hexagon strokeWidth={1.5} className={styles.userBg} size={isActive ? 180 : 100} />
            <User strokeWidth={1} className={styles.user} size={isActive ? 100 : 60} />
            
            {/* Adding additional geometric elements for futuristic look */}
            <motion.div 
              className={styles.orbitRing}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            
            <motion.div 
              className={styles.pulseRing}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          
          {/* Decorative elements for futuristic look */}
          <div className={styles.glowOrbs}>
            {Array(5).fill(0).map((_, i) => (
              <motion.div 
                key={i}
                className={styles.glowOrb}
                animate={{
                  x: Math.random() * 40 - 20,
                  y: Math.random() * 40 - 20,
                  opacity: [0.4, 0.8, 0.4]
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2, 
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  width: `${5 + Math.random() * 10}px`,
                  height: `${5 + Math.random() * 10}px`,
                  backgroundColor: `rgba(${180 + Math.random() * 75}, ${90 + Math.random() * 110}, ${200 + Math.random() * 55}, 0.6)`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Mic status indicator */}
      <div className={styles.icon}>
        {muted ? (
          <MicOff className={styles.micIcon} size={16} />
        ) : (
          <Mic className={styles.micIcon} size={16} />
        )}
      </div>
      
      {/* Active participant indicator for active speaker */}
      {isActive && (
        <div className={styles.activeIndicator}>
          <motion.div 
            className={styles.activeIndicatorDot}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span>Active</span>
        </div>
      )}
    </div>
  );
};

export default Player;
