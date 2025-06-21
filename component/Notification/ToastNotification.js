import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Notification.module.css';

const ToastNotification = () => {
  const [toasts, setToasts] = useState([]);
  
  useEffect(() => {
    // Handler for showing toast notifications
    const handleShowToast = (e) => {
      const { title, message } = e.detail;
      const id = Date.now(); // Unique ID for each toast
      
      // Add the new toast
      setToasts(prev => [...prev, { id, title, message }]);
      
      // Remove the toast after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 5000);
    };
    
    // Add event listener
    window.addEventListener('show-toast-notification', handleShowToast);
    
    // Clean up
    return () => {
      window.removeEventListener('show-toast-notification', handleShowToast);
    };
  }, []);
  
  return (
    <div className={styles.toastContainer}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={styles.toast}
          >
            <div className={styles.toastTitle}>{toast.title}</div>
            <div className={styles.toastMessage}>{toast.message}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotification;
