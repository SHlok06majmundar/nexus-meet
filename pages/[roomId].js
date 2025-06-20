import { useEffect, useState } from "react";
import { cloneDeep } from "lodash";
import { motion } from "framer-motion";

import { useSocket } from "@/context/socket";
import usePeer from "@/hooks/usePeer";
import useMediaStream from "@/hooks/useMediaStream";
import usePlayer from "@/hooks/usePlayer";
import { useUser } from "@clerk/nextjs";

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
  const { stream } = useMediaStream();
  const {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom
  } = usePlayer(myId, roomId, peer);
  const [users, setUsers] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { isSignedIn, isLoaded, user } = useUser();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
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

  useEffect(() => {
    if (!socket || !peer || !stream) return;
    const handleUserConnected = (newUser) => {
      console.log(`user connected in room with userId ${newUser}`);

      const call = peer.call(newUser, stream);

      call.on("stream", (incomingStream) => {
        console.log(`incoming stream from ${newUser}`);
        setPlayers((prev) => ({
          ...prev,
          [newUser]: {
            url: incomingStream,
            muted: true,
            playing: true,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [newUser]: call
        }));
      });
    };
    socket.on("user-connected", handleUserConnected);

    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [peer, setPlayers, socket, stream]);
  
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

    const handleToggleVideo = (userId) => {
      console.log(`user with id ${userId} toggled video`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].playing = !copy[userId].playing;
        return { ...copy };
      });
    };    const handleUserLeave = (userId) => {
      console.log(`user ${userId} is leaving the room`);
      users[userId]?.close();
      const playersCopy = cloneDeep(players);
      delete playersCopy[userId];
      setPlayers(playersCopy);
    };

    const handleNewMessage = (message) => {
      console.log(`New message received from ${message.senderId}: ${message.content}`);
      // Only increment unread count if chat is closed
      if (!isChatOpen) {
        setUnreadMessages(prev => prev + 1);
        
        // Show a notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("New message", {
            body: `${message.senderId.substring(0, 5)}: ${message.content}`,
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
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [callerId]: call
        }));
      });
    });
  }, [peer, setPlayers, stream]);
  
  useEffect(() => {
    if (!stream || !myId) return;
    console.log(`setting my stream ${myId}`);
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        url: stream,
        muted: true,
        playing: true,
      },
    }));
  }, [myId, setPlayers, stream]);
  
  // Request notification permission when joining the room
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);
  
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadMessages(0);
    }
  };
  
  // Show loading state while waiting for resources
  if (!socket || !peer || !stream || isLoadingAuth) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>
          <motion.div 
            className={styles.spinnerOuter}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          ></motion.div>          <motion.div 
            className={styles.spinnerMiddle}
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          ></motion.div>
          <motion.div 
            className={styles.spinnerInner}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          ></motion.div>
          <motion.div 
            className={styles.spinnerCore}
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(200, 90, 255, 0.8)",
                "0 0 30px rgba(255, 90, 200, 0.8)", 
                "0 0 20px rgba(200, 90, 255, 0.8)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          ></motion.div>
          <div className={styles.spinnerDots}>
            <div className={styles.spinnerDot}></div>
            <div className={styles.spinnerDot}></div>
            <div className={styles.spinnerDot}></div>
            <div className={styles.spinnerDot}></div>
          </div>
        </div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}          
          transition={{ delay: 0.2 }}
          className="text-2xl font-medium mb-3 text-white text-glow"
        >
          Initializing Secure Connection...
        </motion.h2>
        
        <motion.div 
          className={styles.loadingText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Preparing your virtual meeting space
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-medium mb-3 text-white text-glow"
        >
          Setting up your meeting...
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center"
        >
          <p className="text-blue-300 text-base mb-4">Preparing your secure connection</p>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.roomContainer}>
      {/* Futuristic grid overlay */}
      <div className={styles.gridOverlay}></div>
      <div className={styles.horizontalLines}></div>
      
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
          const { url, muted, playing } = nonHighlightedPlayers[playerId];
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
      
      {/* Chat Button */}
      <ChatButton 
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
