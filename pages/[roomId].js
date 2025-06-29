import { useEffect, useState, useRef } from "react";
import { cloneDeep } from "lodash";
import { motion } from "framer-motion";
import { FaCopy, FaClipboardCheck, FaInfoCircle, FaHandPaper, FaTimes } from "react-icons/fa";
import { MdGridView, MdOutlinePoll, MdOndemandVideo, MdMoreVert } from "react-icons/md";
import { useSocket } from "@/context/socket";
import usePeer from "@/hooks/usePeer";
import useMediaStream from "@/hooks/useMediaStream";
import usePlayer from "@/hooks/usePlayer";
import { useUser } from "@clerk/nextjs";
import ReactionsContainer from "@/component/Reaction/ReactionsContainer";
import NotificationSystem from "@/component/Notification";
import ToastNotification from "@/component/Notification/ToastNotification";
import { 
  setViewportHeight, 
  setupResponsiveListeners, 
  isPortraitMode, 
  getGridClasses,
  isMobileDevice
} from "@/utils/responsiveUtils";

import Player from "@/component/Player";
import Bottom from "@/component/Bottom";
import CopySection from "@/component/CopySection";
import Chat, { ChatButton } from "@/component/Chat";
import ShareMenu from "@/component/ShareMenu";

import styles from "@/styles/room.module.css";
import { useRouter } from "next/router";

const Room = () => {
  const router = useRouter();
  const socket = useSocket();
  const { roomId } = router.query;  
  const { peer, myId } = usePeer();
  const { stream, toggleVideoTrack, initializeStream } = useMediaStream();
  const {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo: originalToggleVideo,
    leaveRoom,
    userName
  } = usePlayer(myId, roomId, peer);
  
  // Track last toggle time to prevent rapid toggling
  const lastToggleTime = useRef(0);
  
  // Enhanced toggleVideo function that also controls the media track
  const toggleVideo = async () => {
    // Debounce to prevent rapid toggling which can cause issues
    const now = Date.now();
    if (now - lastToggleTime.current < 1000) {
      console.log("Toggling too quickly, ignoring request");
      return;
    }
    lastToggleTime.current = now;
    
    // Get the new state (opposite of current state)
    const newVideoState = playerHighlighted ? !playerHighlighted.playing : false;
    
    console.log(`Toggling video to: ${newVideoState} - Current state: ${playerHighlighted?.playing}`);
    
    try {
      // First update the UI state through the original toggle function
      originalToggleVideo();
      
      // Then try to toggle the actual video track
      const success = await toggleVideoTrack(newVideoState);
      
      if (!success && newVideoState) {
        console.log("Failed to toggle video track, attempting to reinitialize stream");
        // If toggling on failed, try to reinitialize the stream
        const newStream = await initializeStream();
        if (newStream) {
          console.log("Successfully reinitialized stream");
          
          // Update the players to reflect the new stream
          setPlayers((prev) => {
            if (prev[myId]) {
              const copy = cloneDeep(prev);
              copy[myId].url = newStream;
              copy[myId].playing = true;
              return { ...copy };
            }
            return prev;
          });
        } else {
          console.error("Failed to reinitialize stream");
          alert("Could not turn on camera. Please check your device permissions.");
        }
      }
    } catch (error) {
      console.error("Error toggling video:", error);
      alert("Could not toggle camera. Please check your device permissions.");
    }
  };
  
  const [users, setUsers] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { isSignedIn, isLoaded, user } = useUser();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isPortrait, setIsPortrait] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState('chat');
  const [isRoomInfoVisible, setIsRoomInfoVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [viewMode, setViewMode] = useState('tiled'); // 'tiled', 'spotlight', 'sidebar'
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [raisedHands, setRaisedHands] = useState({}); // Track users who raised hands

  // Track device orientation for responsive layout
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(isPortraitMode());
    };
    
    // Check on mount
    checkOrientation();
    
    // Add listeners for changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => {
      // Small delay to ensure dimensions are updated after orientation change
      setTimeout(checkOrientation, 100);
    });
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Handle auth redirection and prejoin check
  useEffect(() => {
    if (isLoaded) {
      setIsLoadingAuth(false);
      if (!isSignedIn) {
        // Store the room ID in query params so user can be redirected back after login
        router.push({
          pathname: '/sign-in',
          query: { redirect_url: `/${roomId}` }
        });
        return;
      }
      
      // Check if user has gone through prejoin process
      const comingFromPrejoin = sessionStorage.getItem('comingFromPrejoin');
      const meetingPreferences = sessionStorage.getItem('meetingPreferences');
      
      // Allow direct access for authenticated users, but redirect new/anonymous users to prejoin
      if (!comingFromPrejoin && !meetingPreferences) {
        // Only redirect to prejoin if this seems like a new session
        // Check if this is a fresh browser session without user preferences
        const hasUserPreferences = user?.fullName || user?.firstName || user?.username;
        
        if (!hasUserPreferences) {
          // No user data available, definitely need prejoin
          router.push(`/prejoin?roomId=${roomId}`);
          return;
        }
        
        // User has Clerk data, we can proceed but set default preferences
        sessionStorage.setItem('meetingPreferences', JSON.stringify({
          displayName: user.fullName || user.firstName || user.username || 'Guest',
          isVideoEnabled: true,
          isAudioEnabled: true
        }));
      }
      
      // Clear the prejoin flag after successful entry
      if (comingFromPrejoin) {
        sessionStorage.removeItem('comingFromPrejoin');
      }
    }
  }, [isLoaded, isSignedIn, router, roomId]);

  // Effect to handle room joining and user connection
  useEffect(() => {
    if (!socket || !peer || !stream) return;
    
    // Join the room with user name from Clerk
    if (roomId && myId && userName) {
      socket.emit("join-room", roomId, myId, userName);
      
      // Immediately announce our username to all existing users in the room
      socket.emit("update-user-name", myId, roomId, userName);
      
      // Dispatch join notification for ourselves
      setTimeout(() => {
        const joinEvent = new CustomEvent("user-join-notification", {
          detail: { userName: userName }
        });
        window.dispatchEvent(joinEvent);
        
        // After a short delay, request usernames from all other users
        // This helps handle the case where we joined after others
        socket.emit("update-user-name", myId, roomId, userName);
      }, 1000);
      
      // Send additional username announcements with increasing delays
      // to ensure everyone receives it (network race conditions)
      [2000, 3500, 5000].forEach(delay => {
        setTimeout(() => {
          socket.emit("update-user-name", myId, roomId, userName);
        }, delay);
      });
    }
    
    const handleUserConnected = (newUser, newUserName) => {
      // Always use the provided name if available, with a clear fallback pattern
      const displayName = newUserName && newUserName !== "undefined" && newUserName !== "null" 
                          ? newUserName 
                          : `User ${newUser.substring(0, 5)}`;
      
      console.log(`user ${displayName} connected in room`);
      
      // Immediately add the user to the players list with the initial name
      // This ensures they show up in the UI even before the call is established
      setPlayers((prev) => {
        // Only update if player doesn't exist yet to avoid overwriting
        if (!prev[newUser]) {
          return {
            ...prev,
            [newUser]: {
              url: null, // Will be filled when stream is received
              muted: true,
              playing: true,
              userName: displayName,
            }
          };
        }
        return prev;
      });

      // Include userName metadata in outgoing call
      const callOptions = {
        metadata: {
          userName: userName
        }
      };
      
      const call = peer.call(newUser, stream, callOptions);

      call.on("stream", (incomingStream) => {
        console.log(`incoming stream from ${displayName}`);
        
        // Update player with the actual stream
        setPlayers((prev) => ({
          ...prev,
          [newUser]: {
            ...prev[newUser],
            url: incomingStream,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [newUser]: call
        }));
        
        // When we get a stream, we know the connection is established
        // Emit our userName to all users to ensure they have the correct name
        if (socket && userName && roomId) {
          console.log(`Emitting userName update after connection: ${userName}`);
          socket.emit("update-user-name", myId, roomId, userName);
          
          // After a brief delay, request the user's name again to ensure we have the most up-to-date name
          setTimeout(() => {
            socket.emit("request-username", myId, newUser, roomId);
          }, 1000);
        }
        
        // Dispatch join notification event
        const joinEvent = new CustomEvent("user-join-notification", {
          detail: { userName: displayName }
        });
        window.dispatchEvent(joinEvent);
      });
      
      // Handle call errors
      call.on("error", (err) => {
        console.error("Peer call error:", err);
        
        // Still request the username even if the call fails
        if (socket && roomId) {
          socket.emit("request-username", myId, newUser, roomId);
        }
      });
    };
    
    socket.on("user-connected", handleUserConnected);

    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [peer, setPlayers, socket, stream, roomId, myId, userName]);
  
  // Effect to handle various socket events (toggle audio, video, user leave, etc.)
  useEffect(() => {
    if (!socket) return;
      const handleToggleAudio = (userId) => {
      const userDisplayName = players[userId]?.userName || `User ${userId.substring(0, 5)}`;
      console.log(`${userDisplayName} toggled audio`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].muted = !copy[userId].muted;
        return { ...copy };
      });
    };
    
    const handleToggleVideo = (userId, videoState) => {
      const userDisplayName = players[userId]?.userName || `User ${userId.substring(0, 5)}`;
      console.log(`${userDisplayName} toggled video to ${videoState}`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        // Use the videoState value sent from the server instead of toggling
        copy[userId].playing = videoState !== undefined ? videoState : !copy[userId].playing;
        return { ...copy };
      });
    };

    const handleUserNameUpdated = (userId, updatedUserName) => {
      console.log(`Received userName update for ${userId}: ${updatedUserName}`);
      if (userId && updatedUserName) {
        setPlayers((prev) => {
          if (prev[userId]) {
            const copy = cloneDeep(prev);
            copy[userId].userName = updatedUserName;
            // Clear the pending name request flag if it exists
            if (copy[userId].pendingNameRequest) {
              delete copy[userId].pendingNameRequest;
            }
            return { ...copy };
          }
          return prev;
        });
      }
    };
    
    // Handle username request events
    const handleUsernameRequested = (requesterId, targetUserId) => {
      // If we are the target user, respond with our username
      if (targetUserId === myId && userName) {
        console.log(`Username requested by ${requesterId}, sending my name: ${userName}`);
        socket.emit("update-user-name", myId, roomId, userName);
      }
    };
      
    const handleUserRaisedHand = (userId, userName) => {
      // Use the provided userName, or get from players state, or fallback to shortened ID
      const userDisplayName = userName || players[userId]?.userName || `User ${userId.substring(0, 5)}`;
      console.log(`${userDisplayName} raised hand`);
      setRaisedHands(prev => ({
        ...prev,
        [userId]: true
      }));
      
      // Create and dispatch a notification
      const handRaiseEvent = new CustomEvent("show-toast-notification", {
        detail: { 
          title: "Hand Raised",
          message: `${userDisplayName} raised their hand`
        }
      });
      window.dispatchEvent(handRaiseEvent);
    };
    
    const handleUserLoweredHand = (userId) => {
      const userDisplayName = players[userId]?.userName || `User ${userId.substring(0, 5)}`;
      console.log(`${userDisplayName} lowered hand`);
      setRaisedHands(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    };
    
    const handleUserLeave = (userId) => {
      // Get the user's name before removing them
      const leavingUserName = players[userId]?.userName || `User ${userId.substring(0, 5)}`;
      console.log(`user ${leavingUserName} (${userId}) is leaving the room`);
      
      users[userId]?.close();
      const playersCopy = cloneDeep(players);
      delete playersCopy[userId];
      setPlayers(playersCopy);
      
      // Dispatch leave notification event
      const leaveEvent = new CustomEvent("user-leave-notification", {
        detail: { userName: leavingUserName }
      });
      window.dispatchEvent(leaveEvent);
    };    const handleNewMessage = (message) => {
      console.log(`New message received from ${message.senderId}: ${message.content}`);
      // Only increment unread count if chat is closed and it's not a system message
      if (!isChatOpen && !message.isSystemMessage) {
        setUnreadMessages(prev => prev + 1);
        
        // Create a toast notification instead of browser notification
        // This avoids the Notification API issues in some contexts
        const senderName = message.senderName || `User ${message.senderId.substring(0, 5)}`;
        
        // Create and dispatch a custom event for showing a toast notification
        const notificationEvent = new CustomEvent("show-toast-notification", {
          detail: { 
            title: `New message from ${senderName}`,
            message: message.content
          }
        });
        window.dispatchEvent(notificationEvent);
      }
    };    socket.on("user-toggle-audio", handleToggleAudio);
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("user-leave", handleUserLeave);
    socket.on("new-message", handleNewMessage);
    socket.on("user-raised-hand", handleUserRaisedHand);
    socket.on("user-lowered-hand", handleUserLoweredHand);
    socket.on("user-name-updated", handleUserNameUpdated);
    socket.on("username-requested", handleUsernameRequested);
    
    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("user-leave", handleUserLeave);
      socket.off("new-message", handleNewMessage);
      socket.off("user-raised-hand", handleUserRaisedHand);
      socket.off("user-lowered-hand", handleUserLoweredHand);
      socket.off("user-name-updated", handleUserNameUpdated);
      socket.off("username-requested", handleUsernameRequested);
    };
  }, [players, setPlayers, socket, users, isChatOpen, myId, userName, roomId]);
  // Handle incoming calls
  useEffect(() => {
    if (!peer || !stream || !socket || !userName || !roomId) return;
    peer.on("call", (call) => {
      const { peer: callerId } = call;
      
      // Try to get user name from call metadata
      let callerName = null;
      try {
        if (call.metadata && call.metadata.userName) {
          callerName = call.metadata.userName;
          console.log(`Got username from call metadata: ${callerName}`);
        }
      } catch (e) {
        console.error("Error extracting metadata from call", e);
      }
      
      // Include our metadata in the answer
      const answerOptions = {
        metadata: {
          userName: userName
        }
      };
      
      call.answer(stream, answerOptions);
      
      call.on("stream", (incomingStream) => {
        console.log(`Incoming stream from user ${callerId}`);
        
        // Set player with the best name we have and request an update if needed
        setPlayers((prev) => {
          // Get the best username we have from different sources
          const existingPlayer = prev[callerId];
          const existingName = existingPlayer?.userName;
          
          // Determine best name in priority order:
          // 1. Existing confirmed name that isn't generic
          // 2. Name from call metadata
          // 3. Existing name even if generic
          // 4. Generic fallback
          let bestName;
          if (existingName && !existingName.includes(`User ${callerId.substring(0, 5)}`)) {
            bestName = existingName;
          } else if (callerName) {
            bestName = callerName;
          } else {
            bestName = existingName || `User ${callerId.substring(0, 5)}`;
          }
          
          const needsNameUpdate = bestName.includes(`User ${callerId.substring(0, 5)}`);
          
          if (needsNameUpdate) {
            // Request the user's real name
            socket.emit("request-username", myId, callerId, roomId);
          }
          
          return {
            ...prev,
            [callerId]: {
              url: incomingStream,
              muted: existingPlayer?.muted ?? true,
              playing: existingPlayer?.playing ?? true,
              userName: bestName,
              pendingNameRequest: needsNameUpdate
            },
          };
        });
        
        // After answering the call, emit our userName to ensure all users get it
        if (socket && userName && roomId) {
          console.log(`Emitting userName update after answering call: ${userName}`);
          socket.emit("update-user-name", myId, roomId, userName);
        }
      });
    });
  }, [peer, stream, setPlayers, socket, userName, roomId, myId]);
  // Effect to manage chat and sidebar
  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
    if (!isChatOpen) {
      setUnreadMessages(0);
      setActiveSidebarTab('chat');
    }
  };
  
  const togglePeopleTab = () => {
    setIsChatOpen(true);
    setActiveSidebarTab('people');
  };

  const toggleActivities = () => {
    setIsChatOpen(true);
    setActiveSidebarTab('activities');
  };

  // Copy room URL to clipboard
  const copyRoomUrl = () => {
    const roomUrl = `${window.location.origin}/${roomId}`;
    navigator.clipboard.writeText(roomUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Toggle room info panel
  const toggleRoomInfo = () => {
    setIsRoomInfoVisible(prev => !prev);
  };

  // Toggle more options menu
  const toggleMoreOptions = () => {
    setShowMoreOptions(prev => !prev);
  };

  // Switch view mode (tiled, spotlight, sidebar)
  const cycleViewMode = () => {
    if (viewMode === 'tiled') setViewMode('spotlight');
    else if (viewMode === 'spotlight') setViewMode('sidebar');
    else setViewMode('tiled');
  };
  
  // Handle raise hand functionality
  const raiseHand = () => {
    // If hand is already raised, lower it
    if (raisedHands[myId]) {
      // Create and dispatch a custom event for lowering hand
      const lowerHandEvent = new CustomEvent("lower-hand");
      window.dispatchEvent(lowerHandEvent);
      
      // Update local state immediately for responsive UI
      setRaisedHands(prev => {
        const updated = { ...prev };
        delete updated[myId];
        return updated;
      });
    } else {
      // Create and dispatch a custom event for raising hand
      const raiseHandEvent = new CustomEvent("raise-hand", {
        detail: { userName }
      });
      window.dispatchEvent(raiseHandEvent);
      
      // Update local state immediately for responsive UI
      setRaisedHands(prev => ({
        ...prev,
        [myId]: true
      }));
    }
  };

  // Initialize notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Add our own name to the players object when we join
  useEffect(() => {
    if (myId && stream && userName) {
      setPlayers((prev) => {
        if (prev[myId]) return prev; // Only set once
        return {
          ...prev,
          [myId]: {
            url: stream,
            muted: true,
            playing: true,
            userName: userName,
          }
        };
      });
    }
  }, [myId, stream, setPlayers, userName]);

  // Effect to ensure video track state stays consistent with the UI state
  useEffect(() => {
    if (playerHighlighted && stream) {
      // Make sure the video track enabled state matches the UI
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && videoTrack.enabled !== playerHighlighted.playing) {
        console.log(`Enforcing video track state: ${playerHighlighted.playing}`);
        videoTrack.enabled = playerHighlighted.playing;
      }
    }
  }, [playerHighlighted, stream]);
  // Close more options menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (showMoreOptions && !event.target.closest(`.${styles.controlButton}`)) {
        setShowMoreOptions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreOptions, styles.controlButton]);
  
  // Add viewport height fix for mobile and set up responsive listeners
  useEffect(() => {
    // Initialize all responsive utilities
    setupResponsiveListeners();
    
    return () => {
      // Cleanup will be handled by the utility function
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);
  // Show loading screen while auth is being loaded
  if (isLoadingAuth) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={styles.loadingText}
        >
          Setting up your meeting...
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className={styles.loadingDots}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Determine the appropriate container class for layout
  const isMobile = typeof window !== 'undefined' ? isMobileDevice() : false;
  
  // Apply special class for view modes and responsive classes
  const roomContainerClass = `${styles.roomContainer} ${
    styles[`${viewMode}Mode`]
  } ${
    isChatOpen ? styles.sidebarOpen : ''
  } ${
    // Add responsive classes
    isMobile ? (isPortrait ? styles.portraitMode : styles.landscapeMode) : ''
  }`;
  
  // The main room UI with all Google Meet zones
  return (
    <div className={roomContainerClass}>
      {/* Notification Systems */}
      <NotificationSystem />
      <ToastNotification />
      
      {/* Background effects */}
      <div className={styles.gridOverlay}></div>
      <div className={styles.horizontalLines}></div>
      <div className={styles.lightSpot1}></div>
      <div className={styles.lightSpot2}></div>
      
      {/* 1. TOP BAR (HEADER) - Height: 56px */}
      <div className={styles.roomHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.meetingInfo}>
            <span>{roomId}</span>
            {isRoomInfoVisible ? (
              <FaClipboardCheck onClick={toggleRoomInfo} className={styles.iconButton} />
            ) : (
              <FaInfoCircle onClick={toggleRoomInfo} className={styles.iconButton} />
            )}
          </div>
          <div className={styles.divider}></div>
          <div className={styles.headerButton}>
            <ShareMenu roomId={roomId} />
          </div>
        </div>
        
        <div className={styles.headerCenter}>          
          <div className={styles.headerButton} onClick={cycleViewMode}>
            <MdGridView className={styles.iconButton} title="Change layout" />
          </div>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.meetingTime}>
            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
          {user && (
            <div className={styles.userAvatar}>
              {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>
      </div>      {/* Room info panel (if visible) */}
      {isRoomInfoVisible && (
        <div className={styles.roomInfoPanel}>
          <h3>
            Meeting Details
            <button className={styles.closeInfoPanel} onClick={toggleRoomInfo}>✕</button>
          </h3>
          <div className={styles.roomInfoContent}>
            <div className={styles.roomIdContainer}>
              <span>Meeting ID: {roomId}</span>
            </div>
            <button onClick={copyRoomUrl} className={styles.copyButton}>
              {copySuccess ? <FaClipboardCheck /> : <FaCopy />}
              {copySuccess ? 'Link copied to clipboard' : 'Share meeting link'}
            </button>            <div className={styles.joinInfo}>
              <p>Share this meeting link with others you want in the meeting.</p>
              <div className={styles.securityNote}>
                <FaInfoCircle size={12} style={{marginRight: '6px'}} />
                <span>Share this link with people you want to join the meeting. Anyone with the link can join.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reactions container for displaying emojis */}
      <ReactionsContainer />
      
      {/* 4. MAIN CONTENT AREA (VIDEO GRID) */}      <div className={styles.mainContentArea}>
        <div id="videoGrid" className={`${styles.videoGrid} ${styles[`${viewMode}Grid`]}`}>
          {/* Active speaker */}
          {playerHighlighted && (            <div className={`${styles.videoTile} ${
              Object.keys(nonHighlightedPlayers).length > 0 && viewMode === 'spotlight' 
                ? styles.activeSpeakerTile 
                : ''
            }`}>              <Player
                url={playerHighlighted.url}
                muted={playerHighlighted.muted}
                playing={playerHighlighted.playing}
                userName={playerHighlighted.userName}
                handRaised={raisedHands[myId]}
                isLocal={true} // playerHighlighted is always the current user in this context
                isActive
              />
            </div>
          )}
          
          {/* Other participants */}
          {Object.keys(nonHighlightedPlayers).length > 0 && (
            Object.keys(nonHighlightedPlayers).map((playerId) => {
              const { url, muted, playing, userName } = nonHighlightedPlayers[playerId];
              return (
                <div 
                  key={playerId}
                  className={styles.videoTile}
                >                  <Player
                    url={url}
                    muted={muted}
                    playing={playing}
                    userName={userName}
                    handRaised={raisedHands[playerId]}
                    isLocal={false} // Other participants are never local
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* 5. BOTTOM CONTROL BAR - Height: 72px */}
      <div className={styles.controlBar}>
        <div className={styles.controlsLeft}>
          <div className={styles.meetingInfo}>
            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        </div>
          <div className={styles.controlsCenter}>          <Bottom
            muted={playerHighlighted?.muted}
            playing={playerHighlighted?.playing}
            toggleAudio={toggleAudio}
            toggleVideo={toggleVideo}
            leaveRoom={leaveRoom}
            toggleChat={toggleChat}
            togglePeopleTab={togglePeopleTab}
            roomId={roomId}
            players={players}
            myId={myId}
            myStream={stream} // Pass the stream for local recording
          />
        </div>
          <div className={styles.controlsRight}>
             {/* Removed meeting details and more options buttons */}
           </div>
       </div>
       {/* Floating Chat Button (when sidebar is closed) */}
      <ChatButton 
        visible={!isChatOpen}
        unreadCount={unreadMessages}
        onClick={toggleChat} 
      />
      
      {/* 7. FLOATING ELEMENTS - Self View Tile */}
      {playerHighlighted && myId && viewMode !== 'sidebar' && (
        <div className={styles.selfViewTile}>          <Player
            url={playerHighlighted.url}
            muted={true} // Always mute self view
            playing={playerHighlighted.playing}
            userName={userName || 'You'}
            handRaised={raisedHands[myId]}
            isLocal={true}
          />
        </div>
      )}
      
      {/* 6. RIGHT SIDEBAR PANEL - Width: 320px */}
      <div className={`${styles.rightSidebar} ${!isChatOpen ? styles.rightSidebarClosed : ''}`}>        <div className={styles.sidebarTabs}>
          <div 
            className={`${styles.sidebarTab} ${activeSidebarTab === 'chat' ? styles.activeTab : ''}`}
            onClick={() => setActiveSidebarTab('chat')}
          >
            Chat
          </div>
          <div 
            className={`${styles.sidebarTab} ${activeSidebarTab === 'people' ? styles.activeTab : ''}`}
            onClick={() => setActiveSidebarTab('people')}
          >
            People ({Object.keys(players).length})
          </div>
          <div 
            className={`${styles.sidebarTab} ${activeSidebarTab === 'activities' ? styles.activeTab : ''}`}
            onClick={() => setActiveSidebarTab('activities')}
          >
            Act.
          </div><button 
            className={styles.closeSidebar} 
            onClick={() => setIsChatOpen(false)}
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <FaTimes size={14} />
          </button>
        </div>
        
        <div className={styles.sidebarContent}>
          {activeSidebarTab === 'chat' && (
            <Chat 
              socket={socket}
              roomId={roomId}
              myId={myId}
              players={players}
              visible={true}
              onClose={toggleChat}
            />
          )}
          
          {activeSidebarTab === 'people' && (
            <div className={styles.peopleList}>
              {Object.entries(players).map(([playerId, player]) => (
                <div key={playerId} className={styles.participantItem}>
                  <div className={styles.participantAvatar}>
                    {player.userName ? player.userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className={styles.participantName}>
                    {playerId === myId ? `${player.userName} (You)` : player.userName}
                  </div>                  <div className={styles.participantControls}>
                    {!player.muted && <div className={styles.participantMicActive} title="Mic on" />}
                    {!player.playing && <div className={styles.participantVideoOff} title="Video off" />}
                    {raisedHands[playerId] && <div className={styles.participantHandRaised} title="Hand raised"><FaHandPaper size={12} /></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
            {activeSidebarTab === 'activities' && (
            <div className={styles.activitiesPanel}>
              <div className={styles.activityItem} onClick={() => setIsPollOpen(true)}>
                <MdOutlinePoll className={styles.activityIcon} />
                <span>Create a poll</span>
              </div>
              <div 
                className={`${styles.activityItem} ${raisedHands[myId] ? styles.activeActivity : ''}`}
                onClick={raiseHand}
              >
                <FaHandPaper className={styles.activityIcon} />
                <span>{raisedHands[myId] ? 'Lower hand' : 'Raise hand'}</span>
              </div>
              <div className={styles.activityItem}> 
                <MdOndemandVideo className={styles.activityIcon} />
                <span>Record meeting</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>  
  );
};

export default Room;
