import { useState, useEffect } from 'react';
import { useSocket } from "@/context/socket";
import { v4 as uuidv4 } from 'uuid';
import Reaction from './index';
import styles from "./index.module.css";

const ReactionsContainer = ({ roomId }) => {
  const socket = useSocket();
  const [reactions, setReactions] = useState([]);
  
  useEffect(() => {
    if (!socket) return;
    
    // Listen for reactions from the socket
    const handleReaction = (userId, emoji) => {
      const newReaction = {
        id: uuidv4(),
        emoji,
        position: {
          left: `${Math.random() * 80 + 10}%`, // Random position
          bottom: `${Math.random() * 30 + 10}%` // Random position
        }
      };
      
      setReactions(prev => [...prev, newReaction]);
      
      // Remove the reaction after animation completes
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== newReaction.id));
      }, 2000);
    };
    
    socket.on('user-reaction', handleReaction);
    
    return () => {
      socket.off('user-reaction', handleReaction);
    };
  }, [socket, roomId]);
  
  return (
    <div className={styles.reactionsContainer}>
      {reactions.map((reaction) => (
        <div
          key={reaction.id}
          className={styles.reactionWrapper}
          style={{ 
            left: reaction.position.left,
            bottom: reaction.position.bottom
          }}
        >
          <Reaction emoji={reaction.emoji} />
        </div>
      ))}
    </div>
  );
};

export default ReactionsContainer;
