import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Copy, CheckCircle2, Share2, GitBranch } from "lucide-react";
import { motion } from "framer-motion";

import styles from "@/component/CopySection/index.module.css";

const CopySection = (props) => {
  const { roomId } = props;
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={styles.copyContainer}
    >
      <motion.div 
        className={styles.shareIcon}
        whileHover={{ rotate: 15, scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <GitBranch className={styles.branchIcon} size={18} />
        <Share2 size={18} />
      </motion.div>

      <div className={styles.meetingInfoWrapper}>
        <div className={styles.idLabel}>Meeting ID:</div>
        <motion.div 
          className={styles.roomId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {roomId}
        </motion.div>
      </div>

      <CopyToClipboard text={roomId} onCopy={handleCopy}>
        <motion.button 
          className={styles.copyButton}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}            
          animate={copied ? { 
            boxShadow: "0 0 20px rgba(0, 255, 170, 0.7)",
          } : {}}
          transition={{ duration: 0.5 }}
        >
          {copied ? (              
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <CheckCircle2 size={18} className={styles.checkIcon} />
            </motion.div>
          ) : (
            <Copy size={18} className={styles.copyIcon} />
          )}
          <span className={styles.copyButtonText}>{copied ? "Copied" : "Copy"}</span>
        </motion.button>
      </CopyToClipboard>
    </motion.div>
  );
};

export default CopySection;