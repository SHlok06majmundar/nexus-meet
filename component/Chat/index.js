import { useState, useEffect, useRef } from "react";
import styles from "@/component/Chat/index.module.css";

const Chat = ({ socket, roomId, userId, isOpen, onClose }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    if (!socket || !roomId || !userId) return;

    const handleReceiveMessage = (data) => {
      console.log("Received message:", data);
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

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket, roomId, userId]);

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
      timestamp: timestamp,
      isSelf: true,
    };

    // Emit the message to the server
    socket.emit("send-message", {
      content: message,
      sender: userId,
      roomId,
      timestamp: timestamp,
    });

    // Add the message to our local state
    setMessages((prev) => [...prev, messageData]);
    setMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h3>Chat</h3>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>
      
      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <p className={styles.noMessages}>No messages yet</p>
        ) : (
          messages.map((msg, index) => (            <div
              key={index}
              className={`${styles.message} ${
                msg.isSelf || msg.sender === userId ? styles.selfMessage : 
                msg.sender === 'system' ? styles.systemMessage : styles.otherMessage
              }`}
            >
              {msg.sender !== 'system' && msg.sender !== userId && (
                <p className={styles.senderName}>
                  {typeof msg.sender === 'string' ? msg.sender.substring(0, 8) : 'User'}...
                </p>
              )}
              <p className={styles.messageContent}>{msg.content}</p>
              <span className={styles.messageTime}>
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
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
        <button type="submit" className={styles.sendButton}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
