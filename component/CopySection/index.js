import { CopyToClipboard } from "react-copy-to-clipboard";
import { Copy, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";

import styles from "@/component/CopySection/index.module.css";

const CopySection = (props) => {
  const { roomId } = props;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    toast.success('Room ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      className={styles.copyContainer}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className={styles.copyHeading}>Meeting ID:</div>
      <div className={styles.copyDescription}>
        <span className={styles.roomIdText}>{roomId?.substring(0, 8)}...</span>
        <CopyToClipboard text={roomId} onCopy={handleCopy}>
          <div className={styles.copyButton}>
            {copied ? 
              <CheckCheck size={18} className="text-highlight" /> : 
              <Copy size={18} className="text-lightText" />
            }
          </div>
        </CopyToClipboard>
      </div>
    </motion.div>
  );
};

export default CopySection;