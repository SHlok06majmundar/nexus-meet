import ReactPlayer from "react-player";
import cx from "classnames";
import { Mic, MicOff, User, Hexagon } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

import styles from "@/component/Player/index.module.css";

const Player = (props) => {
  const { url, muted, playing, isActive, userName } = props;
  // Use the provided userName or a default value
  const displayName = userName || "User";
  
  // Track when player is ready and if there were any errors
  const [isPlayerReady, setPlayerReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const playerRef = useRef(null);
  
  // Reset error state whenever url or playing changes
  useEffect(() => {
    setHasError(false);
  }, [url, playing]);
  
  // Log player state changes for debugging
  useEffect(() => {
    console.log(`Player state: ${displayName} - playing: ${playing}, muted: ${muted}`);
  }, [playing, muted, displayName]);
  
  return (
    <div
      className={cx(styles.playerContainer, {
        [styles.notActive]: !isActive,
        [styles.active]: isActive,
        [styles.notPlaying]: !playing,
      })}
    >
      {/* Only render ReactPlayer when we have a URL */}
      {url && (
        <ReactPlayer
          ref={playerRef}
          url={url}
          muted={muted}
          playing={true}  // Always keep playing for audio
          width="100%"
          height="100%"
          style={{ display: playing ? 'block' : 'none' }}  // Hide video when not playing
          onReady={() => {
            console.log(`Player ready: ${displayName}`);
            setPlayerReady(true);
          }}
          onError={(err) => {
            console.error(`Player error: ${displayName}`, err);
            setHasError(true);
          }}
          config={{
            file: {
              forceVideo: playing, // Force video when playing is true
              forceAudio: true,    // Always force audio
              attributes: {
                // Improve performance and force hardware acceleration
                style: {
                  objectFit: 'cover'
                }
              }
            }
          }}
        />
      )}
      
      {/* User name display */}
      <div className={styles.nameTag}>
        {displayName}
        {muted && <MicOff className={styles.nameTagIcon} size={14} />}
      </div>
      
      {/* Show futuristic user icon when video is off or on error */}
      {(!playing || hasError) && (
        <div className={styles.userIconContainer}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
            }}
            transition={{ 
              duration: 2,
              ease: "easeOut"
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
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Audio indicator when muted is false */}
      {!muted && (
        <div className={styles.audioIndicatorContainer}>
          <div className={styles.audioIndicator}>
            <motion.div 
              className={styles.audioBar} 
              animate={{ height: ["20%", "80%", "40%", "60%", "20%"] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
            />
            <motion.div 
              className={styles.audioBar} 
              animate={{ height: ["40%", "20%", "60%", "30%", "40%"] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop", delay: 0.2 }}
            />
            <motion.div 
              className={styles.audioBar} 
              animate={{ height: ["60%", "40%", "80%", "20%", "60%"] }}
              transition={{ duration: 1.8, repeat: Infinity, repeatType: "loop", delay: 0.4 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
