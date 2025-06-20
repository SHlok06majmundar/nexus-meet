import { useEffect, useState } from "react";
import { cloneDeep } from "lodash";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Head from "next/head";
import toast from "react-hot-toast";

import { useSocket } from "@/context/socket";
import usePeer from "@/hooks/usePeer";
import useMediaStream from "@/hooks/useMediaStream";
import usePlayer from "@/hooks/usePlayer";

import Player from "@/component/Player";
import Bottom from "@/component/Bottom";
import CopySection from "@/component/CopySection";
import Chat from "@/component/Chat";

import styles from "@/styles/room.module.css";
import { useRouter } from "next/router";

const Room = () => {
  const socket = useSocket();
  const router = useRouter();
  const { roomId } = router.query;
  const { peer, myId } = usePeer();
  const { stream } = useMediaStream();
  const { user, isLoaded } = useUser();
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
  const [isConnecting, setIsConnecting] = useState(true);
  
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    // Toggle a class on the body to adjust layout
    if (!isChatOpen) {
      document.body.classList.add('chat-open');
    } else {
      document.body.classList.remove('chat-open');
    }
  };
  
  // Add a user joined notification
  useEffect(() => {
    if (stream && peer && myId) {
      setTimeout(() => {
        setIsConnecting(false);
        toast.success('You joined the meeting!');
      }, 2000);
    }
  }, [stream, peer, myId]);
  useEffect(() => {
    if (!socket || !peer || !stream) return;
    
    // Make sure we explicitly emit join-room when socket connects
    if (socket && roomId && myId) {
      console.log(`Joining room ${roomId} with userId ${myId}`);
      socket.emit('join-room', roomId, myId);
    }
    
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
        }))
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
    };

    const handleUserLeave = (userId) => {
      console.log(`user ${userId} is leaving the room`);
      users[userId]?.close()
      const playersCopy = cloneDeep(players);
      delete playersCopy[userId];
      setPlayers(playersCopy);
    }
    socket.on("user-toggle-audio", handleToggleAudio);
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("user-leave", handleUserLeave);
    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("user-leave", handleUserLeave);
    };
  }, [players, setPlayers, socket, users]);

  useEffect(() => {
    if (!peer || !stream) return;
    peer.on("call", (call) => {
      const { peer: callerId } = call;      call.answer(stream);      call.on("stream", (incomingStream) => {
        console.log(`incoming stream from ${callerId}`);
        setPlayers((prev) => ({
          ...prev,
          [callerId]: {
            url: incomingStream,
            muted: true,
            playing: true, // Default to true, will be updated if needed by socket events
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [callerId]: call
        }));
        
        // After receiving the stream, request the user's video state
        if (socket) {
          console.log('Requesting video state from new peer');
          // Small delay to ensure everything is set up
          setTimeout(() => {
            socket.emit('request-video-state', {
              userId: myId,
              targetId: callerId,
              roomId: roomId
            });
          }, 1500);
        }
      });
    });
  }, [peer, setPlayers, stream, socket, myId, roomId]);useEffect(() => {
    if (!stream || !myId) return;
    console.log(`Setting my stream ${myId}`);
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        url: stream,
        muted: true,
        playing: true, // Default to video on initially
      },
    }));
    
    // If socket exists, broadcast our initial video state
    if (socket) {
      console.log('Broadcasting initial video state: true');
      socket.emit('user-video-state', {
        userId: myId,
        roomId: roomId,
        playing: true
      });
    }
  }, [myId, setPlayers, stream, socket, roomId]);// Show loading state while connecting
  if (isConnecting) {
    return (
      <>
        <Head>
          <title>Joining Meeting | Nexus Meet</title>
        </Head>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="glass-effect rounded-xl p-8 flex flex-col items-center"
          >
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-medium text-lightText mb-2">Connecting to meeting...</h2>
            <p className="text-lightText opacity-70">Setting up your audio and video</p>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Nexus Meet - Active Meeting</title>
      </Head>
      
      <div className={styles.activePlayerContainer}>
        {playerHighlighted && (
          <Player
            url={playerHighlighted.url}
            muted={playerHighlighted.muted}
            playing={playerHighlighted.playing}
            isActive
          />
        )}
      </div>
      
      <div className={styles.inActivePlayerContainer}>
        {Object.keys(nonHighlightedPlayers).map((playerId) => {
          const { url, muted, playing } = nonHighlightedPlayers[playerId];
          return (
            <Player
              key={playerId}
              url={url}
              muted={muted}
              playing={playing}
              isActive={false}
            />
          );
        })}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CopySection roomId={roomId}/>
      </motion.div>
      
      <Bottom
        muted={playerHighlighted?.muted}
        playing={playerHighlighted?.playing}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        leaveRoom={leaveRoom}
        toggleChat={toggleChat}
        isChatOpen={isChatOpen}
      />
      
      {socket && (
        <Chat 
          socket={socket} 
          roomId={roomId} 
          userId={myId}
          userName={user?.firstName || "Anonymous"} 
          isOpen={isChatOpen} 
          onClose={toggleChat}
        />
      )}
    </>
  );
};

export default Room;
