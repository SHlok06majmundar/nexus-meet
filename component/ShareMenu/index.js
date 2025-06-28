import { useState, useRef, useEffect } from 'react';
import { 
  FaShare, 
  FaCopy, 
  FaEnvelope, 
  FaWhatsapp,
  FaTwitter,
  FaFacebook,
  FaClipboardCheck
} from 'react-icons/fa';
import styles from './ShareMenu.module.css';

const ShareMenu = ({ roomId }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const menuRef = useRef(null);
  
  const meetingUrl = typeof window !== 'undefined' ? `${window.location.origin}/${roomId}` : '';
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Copy meeting link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };
  
  // Share via email
  const shareViaEmail = () => {
    const subject = 'Join my Google Meet Clone meeting';
    const body = `Join my meeting using this link: ${meetingUrl}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    setIsMenuOpen(false);
  };
  
  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    const text = `Join my meeting: ${meetingUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setIsMenuOpen(false);
  };
  
  // Share via Twitter
  const shareViaTwitter = () => {
    const text = `Join my video meeting: ${meetingUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    setIsMenuOpen(false);
  };
  
  // Share via Facebook
  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(meetingUrl)}`, '_blank');
    setIsMenuOpen(false);
  };
  
  return (
    <div className={styles.shareContainer} ref={menuRef}>
      <div 
        className={styles.shareButton} 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        title="Share meeting"
      >
        <FaShare className={styles.shareIcon} />
      </div>
      
      {isMenuOpen && (
        <div className={styles.shareMenu}>
          <div className={styles.shareHeader}>
            <h3>Share this meeting</h3>
          </div>
          
          <div className={styles.shareUrl}>
            <input 
              type="text" 
              value={meetingUrl} 
              readOnly 
              className={styles.urlInput}
            />
            <button 
              className={styles.copyButton} 
              onClick={copyToClipboard}
              title="Copy to clipboard"
            >
              {copySuccess ? <FaClipboardCheck /> : <FaCopy />}
            </button>
          </div>
          
          <div className={styles.shareOptions}>
            <button className={styles.shareOption} onClick={shareViaEmail}>
              <FaEnvelope className={styles.optionIcon} />
              <span>Email</span>
            </button>
            
            <button className={styles.shareOption} onClick={shareViaWhatsApp}>
              <FaWhatsapp className={styles.optionIcon} />
              <span>WhatsApp</span>
            </button>
            
            <button className={styles.shareOption} onClick={shareViaTwitter}>
              <FaTwitter className={styles.optionIcon} />
              <span>Twitter</span>
            </button>
            
            <button className={styles.shareOption} onClick={shareViaFacebook}>
              <FaFacebook className={styles.optionIcon} />
              <span>Facebook</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareMenu;
