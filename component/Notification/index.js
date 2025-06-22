import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Notification.module.css";

const Notification = ({ message, type }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`${styles.notification} ${styles[type]}`}
    >
      <div className={styles.message}>{message}</div>
    </motion.div>
  );
};

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    // Listen for custom events
    const handleJoinEvent = (event) => {
      const { userName } = event.detail;
      if (userName) {
        console.log(`Join notification received for: ${userName}`);
        addNotification(`${userName} has joined the meeting`, "join");
      }
    };
    
    const handleLeaveEvent = (event) => {
      const { userName } = event.detail;
      if (userName) {
        console.log(`Leave notification received for: ${userName}`);
        addNotification(`${userName} has left the meeting`, "leave");
      }
    };
    
    // Test notification on mount for debugging
    setTimeout(() => {
      console.log("Creating test notification to ensure system is working");
      addNotification("Notification system active", "system");
    }, 1000);
    
    window.addEventListener("user-join-notification", handleJoinEvent);
    window.addEventListener("user-leave-notification", handleLeaveEvent);
    
    return () => {
      window.removeEventListener("user-join-notification", handleJoinEvent);
      window.removeEventListener("user-leave-notification", handleLeaveEvent);
    };
  }, []);
    // Generate a truly unique ID for notifications
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };
  
  const addNotification = (message, type) => {
    const id = generateUniqueId();
    console.log(`Adding notification: ${message} (${type})`);
    
    setNotifications((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, 5000);
  };
  
  return (
    <div className={styles.notificationContainer}>
      <AnimatePresence>
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;
