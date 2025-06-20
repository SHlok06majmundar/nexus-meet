import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import styles from "@/component/Chat/index.module.css";

const Chat = ({ socket, roomId, userId, userName = 'User', isOpen, onClose }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    if (!socket || !roomId || !userId) return;

    const handleReceiveMessage = (data) => {
      setMessages((prev) => [...prev, {
        ...data,
        isSelf: data.sender === userId
      }]);
    };

    // Make sure we're connected to the room
    if (!socket.connected) {
      socket.connect();
    }
    
    // Make sure we've joined the room for chat
    socket.emit('join-chat-room', roomId, userId);
    
    // Add system message when opening chat
    if (messages.length === 0) {
      setMessages([{
        content: 'Chat messages are only visible to people in this meeting',
        sender: 'system',
        timestamp: new Date().toISOString()
      }]);
    }

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket, roomId, userId, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === "" || !socket) return;

    const timestamp = new Date().toISOString();
    
    const messageData = {
      content: message,
      sender: userId,
      senderName: userName,
      timestamp: timestamp,
      isSelf: true,
    };

    // Emit the message to the server
    socket.emit("send-message", {
      content: message,
      sender: userId,
      senderName: userName,
      roomId,
      timestamp: timestamp,
    });

    // Add the message to our local state
    setMessages((prev) => [...prev, messageData]);
    setMessage("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className={styles.chatContainer}
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        exit={{ x: 300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className={styles.chatHeader}>
          <h3>Meeting Chat</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        
        <div className={styles.messagesContainer}>
          {messages.length === 0 ? (
            <p className={styles.noMessages}>No messages yet</p>
          ) : (
            messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`${styles.message} ${
                  msg.isSelf || msg.sender === userId ? styles.selfMessage : 
                  msg.sender === 'system' ? styles.systemMessage : styles.otherMessage
                }`}
              >
                {msg.sender !== 'system' && msg.sender !== userId && (
                  <p className={styles.senderName}>
                    {msg.senderName || (typeof msg.sender === 'string' ? msg.sender.substring(0, 8) : 'User')}
                  </p>
                )}
                <p className={styles.messageContent}>{msg.content}</p>
                <span className={styles.messageTime}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className={styles.inputContainer} onSubmit={sendMessage}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className={styles.messageInput}
          />
          <button type="submit" className={styles.sendButton} disabled={!message.trim()}>
            <Send size={18} />
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};

export default Chat;
