import { useState, useEffect, useRef } from 'react';
import styles from './index.module.css';
import { X, Send, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const Chat = ({ socket, roomId, myId, players, visible, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  
  // Reset unread count when chat becomes visible
  useEffect(() => {
    if (visible) {
      setUnreadCount(0);
    }
  }, [visible]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
      // Increment unread count only if chat is not visible and it's not a system message
      if (!visible && !message.isSystemMessage) {
        setUnreadCount(prev => prev + 1);
      }
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, visible]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      content: newMessage,
      senderId: myId,
      timestamp: new Date().toISOString(),
      senderName: players[myId]?.userName || `User ${myId.substring(0, 5)}`
    };

    // Add to local state immediately
    setMessages(prev => [...prev, messageData]);
    
    // Send to others
    socket.emit('send-message', messageData, roomId);
    
    // Clear input
    setNewMessage('');
  };

  // Format timestamp as HH:MM
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!visible) return null;

  return (
    <motion.div 
      className={styles.chatContainer}
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.chatHeader}>
        <h3>Meeting Chat</h3>
        <button onClick={onClose} className={styles.closeButton}><X size={20} /></button>
      </div>
      
      <div className={styles.messagesList}>
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`${styles.messageItem} ${
              message.isSystemMessage 
                ? styles.systemMessage 
                : message.senderId === myId 
                  ? styles.myMessage 
                  : styles.otherMessage
            }`}
          >
            {!message.isSystemMessage && (
              <div className={styles.messageHeader}>
                <span className={styles.senderName}>
                  {message.senderId === myId ? 'You' : message.senderName || `User ${message.senderId.substring(0, 5)}`}
                </span>
                <span className={styles.timestamp}>{formatTime(message.timestamp)}</span>
              </div>
            )}
            <div className={styles.messageContent}>
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className={styles.messageForm}>
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..." 
          className={styles.messageInput}
        />
        <button type="submit" className={styles.sendButton}>
          <Send size={18} />
        </button>
      </form>
    </motion.div>
  );
};

// Chat button component
export const ChatButton = ({ onClick, visible, unreadCount }) => {
  if (!visible) return null;
  
  return (
    <motion.button 
      className={styles.chatButton}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MessageSquare size={24} />
      {unreadCount > 0 && (
        <span className={styles.unreadBadge}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </motion.button>
  );
};

export default Chat;
