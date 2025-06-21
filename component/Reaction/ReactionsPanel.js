import { motion } from 'framer-motion';
import styles from '@/component/Bottom/index.module.css';

const ReactionsPanel = ({ onClose, onReactionSend }) => {
  // Handler to ensure events propagate correctly
  const handleReactionClick = (emoji) => {
    if (onReactionSend) {
      onReactionSend(emoji);
    } else {
      // Fallback: Emit a custom event directly for compatibility
      const reactionEvent = new CustomEvent('send-reaction', { 
        detail: { emoji } 
      });
      window.dispatchEvent(reactionEvent);
    }
  };

  return (
    <>
      {/* Backdrop to make reactions more visible */}
      <div 
        className={styles.reactionsBackdrop} 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className={styles.reactionsPanel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.reactionsTitle}>Quick Reactions</div>
        <div className={styles.reactionsList}>
          <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 0.9 }}
            className={styles.reactionButton} 
            onClick={() => handleReactionClick('👍')}
          >
            👍
          </motion.div>            <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 0.9 }}
            className={styles.reactionButton} 
            onClick={() => handleReactionClick('👏')}
          >
            👏
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 0.9 }}
            className={styles.reactionButton} 
            onClick={() => handleReactionClick('❤️')}
          >
            ❤️
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 0.9 }}
            className={styles.reactionButton} 
            onClick={() => handleReactionClick('🎉')}
          >
            🎉
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 0.9 }}
            className={styles.reactionButton} 
            onClick={() => handleReactionClick('😂')}
          >
            😂
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 0.9 }}
            className={styles.reactionButton} 
            onClick={() => handleReactionClick('🙌')}
          >
            🙌
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 0.9 }}
            className={styles.reactionButton} 
            onClick={() => handleReactionClick('👋')}
          >
            👋
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 0.9 }}
            className={styles.reactionButton} 
            onClick={() => handleReactionClick('🤔')}
          >
            🤔
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 0.9 }}
            className={styles.reactionButton} 
            onClick={() => handleReactionClick('✅')}
          >
            ✅
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 0.9 }}
            className={styles.reactionButton} 
            onClick={() => handleReactionClick('❌')}
          >
            ❌
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 0.9 }}
            className={styles.reactionButton} 
            onClick={() => handleReactionClick('🔥')}
          >
            🔥
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 0.9 }}
            className={styles.reactionButton} 
            onClick={() => handleReactionClick('🤣')}
          >
            🤣
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 0.9 }}
            className={styles.reactionButton} 
            onClick={() => handleReactionClick('🚀')}
          >
            🚀
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 0.9 }}
            className={styles.reactionButton} 
            onClick={() => handleReactionClick('😍')}
          >
            😍
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 0.9 }}
            className={styles.reactionButton} 
            onClick={() => handleReactionClick('👎')}
          >
            👎
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.2 }} 
            whileTap={{ scale: 0.9 }}
            className={styles.reactionButton} 
            onClick={() => handleReactionClick('👌')}
          >
            👌
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default ReactionsPanel;
