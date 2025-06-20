import { useState, useEffect, useRef } from 'react';
import styles from './index.module.css';
import { X, Send, MessageSquare } from 'lucide-react';

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
      // Increment unread count only if chat is not visible
      if (!visible) {
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
      senderName: `User ${myId.substring(0, 5)}` // Use a shorter ID as name
    };

    socket.emit('send-message', messageData, roomId);
    
    // Add message to local state immediately
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
  };

  const getSenderName = (senderId) => {
    return senderId === myId ? 'You' : `User ${senderId.substring(0, 5)}`;
  };

  return (
    <div className={`${styles.chatContainer} ${visible ? styles.visible : ''}`}>
      <div className={styles.header}>
        <h3>Chat</h3>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={20} />
        </button>
      </div>
      
      <div className={styles.messageList}>
        {messages.length === 0 ? (
          <div className={styles.noMessages}>No messages yet</div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`${styles.message} ${msg.senderId === myId ? styles.sent : styles.received}`}
            >
              <div className={styles.messageHeader}>
                <span className={styles.sender}>{getSenderName(msg.senderId)}</span>
                <span className={styles.time}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={styles.messageContent}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className={styles.inputContainer}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className={styles.input}
        />
        <button type="submit" className={styles.sendButton} disabled={!newMessage.trim()}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;

export const ChatButton = ({ visible, unreadCount, onClick }) => {
  return (
    <button onClick={onClick} className={styles.chatButton}>
      <MessageSquare size={24} />
      {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
    </button>
  );
};
