import { motion } from "framer-motion";
import styles from "./index.module.css";

const Reaction = ({ emoji }) => {
  return (
    <motion.div
      className={styles.reaction}
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        y: [-10, -40, -80, -100],
        scale: [0.5, 1.2, 1, 0.8]
      }}
      transition={{ 
        duration: 2,
        ease: "easeOut"
      }}
    >
      {emoji}
    </motion.div>
  );
};

export default Reaction;
