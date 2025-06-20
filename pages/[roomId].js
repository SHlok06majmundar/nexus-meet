import { useEffect, useState, useRef } from "react";
import { cloneDeep } from "lodash";
import { motion } from "framer-motion";

import { useSocket } from "@/context/socket";
import usePeer from "@/hooks/usePeer";
import useMediaStream from "@/hooks/useMediaStream";
import usePlayer from "@/hooks/usePlayer";
import { useUser } from "@clerk/nextjs";
import ReactionsContainer from "@/component/Reaction/ReactionsContainer";
import NotificationSystem from "@/component/Notification";

import Player from "@/component/Player";
import Bottom from "@/component/Bottom";
import CopySection from "@/component/CopySection";
import Chat, { ChatButton } from "@/component/Chat";

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
  
  // Handle auth redirection
  useEffect(() => {
    if (isLoaded) {
      setIsLoadingAuth(false);
      if (!isSignedIn) {
        // Store the room ID in query params so user can be redirected back after login
        router.push({
          pathname: '/sign-in',
          query: { redirect_url: `/${roomId}` }
        });
      }
    }
  }, [isLoaded, isSignedIn, router, roomId]);

  // Effect to handle room joining and user connection
  useEffect(() => {
    if (!socket || !peer || !stream) return;
    
    // Join the room with user name from Clerk
    if (roomId && myId && userName) {
      socket.emit("join-room", roomId, myId, userName);
      
      // Dispatch join notification for ourselves
      setTimeout(() => {
        const joinEvent = new CustomEvent("user-join-notification", {
          detail: { userName: userName }
        });
        window.dispatchEvent(joinEvent);
      }, 1000);
    }
    
    const handleUserConnected = (newUser, newUserName) => {
      const displayName = newUserName || `User ${newUser.substring(0, 5)}`;
      console.log(`user ${displayName} connected in room`);

      const call = peer.call(newUser, stream);

      call.on("stream", (incomingStream) => {
        console.log(`incoming stream from ${displayName}`);
        setPlayers((prev) => ({
          ...prev,
          [newUser]: {
            url: incomingStream,
            muted: true,
            playing: true,
            userName: displayName,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [newUser]: call
        }));
        
        // Dispatch join notification event
        const joinEvent = new CustomEvent("user-join-notification", {
          detail: { userName: displayName }
        });
        window.dispatchEvent(joinEvent);
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
      console.log(`user with id ${userId} toggled audio`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].muted = !copy[userId].muted;
        return { ...copy };
      });
    };
    
    const handleToggleVideo = (userId, videoState) => {
      console.log(`user with id ${userId} toggled video to ${videoState}`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        // Use the videoState value sent from the server instead of toggling
        copy[userId].playing = videoState !== undefined ? videoState : !copy[userId].playing;
        return { ...copy };
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
    };

    const handleNewMessage = (message) => {
      console.log(`New message received from ${message.senderId}: ${message.content}`);
      // Only increment unread count if chat is closed and it's not a system message
      if (!isChatOpen && !message.isSystemMessage) {
        setUnreadMessages(prev => prev + 1);
        
        // Show a notification
        if ("Notification" in window && Notification.permission === "granted") {
          const senderName = message.senderName || `User ${message.senderId.substring(0, 5)}`;
          new Notification(`New message from ${senderName}`, {
            body: message.content,
            icon: "/favicon.ico"
          });
        }
      }
    };

    socket.on("user-toggle-audio", handleToggleAudio);
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("user-leave", handleUserLeave);
    socket.on("new-message", handleNewMessage);
    
    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("user-leave", handleUserLeave);
      socket.off("new-message", handleNewMessage);
    };
  }, [players, setPlayers, socket, users, isChatOpen]);

  // Handle incoming calls
  useEffect(() => {
    if (!peer || !stream) return;
    peer.on("call", (call) => {
      const { peer: callerId } = call;
      call.answer(stream);

      call.on("stream", (incomingStream) => {
        console.log(`incoming stream from ${callerId}`);
        setPlayers((prev) => ({
          ...prev,
          [callerId]: {
            url: incomingStream,
            muted: true,
            playing: true,
            userName: `User ${callerId.substring(0, 5)}` // Default name until we get the real one
          },
        }));
      });
    });
  }, [peer, stream, setPlayers]);

  // Effect to manage chat
  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
    if (!isChatOpen) {
      setUnreadMessages(0);
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
  
  // The main room UI
  return (
    <div className={styles.roomContainer}>
      {/* Notification System - Prominently positioned */}
      <NotificationSystem />
      
      {/* Futuristic grid overlay */}
      <div className={styles.gridOverlay}></div>
      <div className={styles.horizontalLines}></div>
      
      {/* Reactions container for displaying emojis */}
      <ReactionsContainer />
      
      {/* Active player container with animation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={styles.activePlayerContainer}
      >
        {playerHighlighted && (
          <Player
            url={playerHighlighted.url}
            muted={playerHighlighted.muted}
            playing={playerHighlighted.playing}
            userName={playerHighlighted.userName}
            isActive
          />
        )}
      </motion.div>
      
      {/* Grid of other participants with animations */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={styles.inActivePlayerContainer}
      >
        {Object.keys(nonHighlightedPlayers).map((playerId, index) => {
          const { url, muted, playing, userName } = nonHighlightedPlayers[playerId];
          return (
            <motion.div
              key={playerId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Player
                url={url}
                muted={muted}
                playing={playing}
                userName={userName}
                isActive={false}
              />
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Meeting ID display with animation */}
      <CopySection roomId={roomId}/>
      
      {/* Controls with animation */}
      <Bottom
        muted={playerHighlighted?.muted}
        playing={playerHighlighted?.playing}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        leaveRoom={leaveRoom}
      />
      
      {/* Chat Button */}      <ChatButton 
        visible={!isChatOpen}
        unreadCount={unreadMessages}
        onClick={toggleChat} 
      />
      
      {/* Chat Component */}      
      <Chat 
        socket={socket}
        roomId={roomId}
        myId={myId}
        players={players}
        visible={isChatOpen}
        onClose={toggleChat}
      />
    </div>
  );
};

export default Room;
