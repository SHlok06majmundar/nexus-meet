import { useState, useEffect, useRef } from 'react';
import { cloneDeep } from 'lodash';
import { useSocket } from '@/context/socket';
import { useRouter } from 'next/router';

const usePlayer = (myId, roomId, peer) => {
    const socket = useSocket();
    const [players, setPlayers] = useState({});
    const router = useRouter();
    
    // Create a ref to hold the current video state to avoid stale closures
    const videoStateRef = useRef(true);
    
    const playersCopy = cloneDeep(players);
    const playerHighlighted = playersCopy[myId];
    delete playersCopy[myId];
    const nonHighlightedPlayers = playersCopy;

    // Handle socket events for video and audio toggling
    useEffect(() => {
        if (!socket || !roomId || !myId) return;
        
        // When a new user connects, send them our current video state
        socket.on('user-connected', (newUserId) => {
            console.log(`New user connected: ${newUserId}, sending current video state: ${videoStateRef.current}`);
            
            // Small delay to ensure the new user has set up their player first
            setTimeout(() => {
                socket.emit('user-video-state', {
                    userId: myId,
                    roomId: roomId,
                    playing: videoStateRef.current
                });
            }, 1000);
        });
        
        // Update our local state when other users toggle their video
        const handleVideoToggle = (userId) => {
            console.log(`User ${userId} toggled video`);
            
            setPlayers(prevPlayers => {
                if (!prevPlayers[userId]) return prevPlayers;
                
                const updatedPlayers = cloneDeep(prevPlayers);
                updatedPlayers[userId].playing = !updatedPlayers[userId].playing;
                return updatedPlayers;
            });
        };

        // Handle direct video state updates from other users
        const handleVideoState = ({userId, playing}) => {
            console.log(`Received video state from ${userId}: playing=${playing}`);
            
            if (userId === myId) return; // Ignore our own updates
            
            setPlayers(prevPlayers => {
                if (!prevPlayers[userId]) return prevPlayers;
                
                const updatedPlayers = cloneDeep(prevPlayers);
                updatedPlayers[userId].playing = playing;
                return updatedPlayers;
            });
        };
        
        // Handle audio toggles
        const handleToggleAudio = (userId) => {
            console.log(`User ${userId} toggled audio`);
            
            setPlayers(prevPlayers => {
                if (!prevPlayers[userId]) return prevPlayers;
                
                const updatedPlayers = cloneDeep(prevPlayers);
                updatedPlayers[userId].muted = !updatedPlayers[userId].muted;
                return updatedPlayers;
            });
        };
        
        // Handle user leaving
        const handleUserLeave = (userId) => {
            console.log(`User ${userId} is leaving the room`);
            setPlayers(prevPlayers => {
                const updatedPlayers = cloneDeep(prevPlayers);
                delete updatedPlayers[userId];
                return updatedPlayers;
            });
        };
          // Handle video state requests
        socket.on('video-state-requested', ({requesterId, roomId}) => {
            console.log(`User ${requesterId} requested my video state`);
            
            // Send our current video state
            socket.emit('user-video-state', {
                userId: myId,
                roomId: roomId,
                playing: videoStateRef.current
            });
        });
        
        // Set up event listeners
        socket.on('user-toggle-video', handleVideoToggle);
        socket.on('user-video-state', handleVideoState);
        socket.on('user-toggle-audio', handleToggleAudio);
        socket.on('user-leave', handleUserLeave);
        
        // Clean up event listeners
        return () => {
            socket.off('user-connected');
            socket.off('user-toggle-video', handleVideoToggle);
            socket.off('user-video-state', handleVideoState);
            socket.off('user-toggle-audio', handleToggleAudio);
            socket.off('user-leave', handleUserLeave);
            socket.off('video-state-requested');
        };
    }, [socket, roomId, myId]);

    // Functions to control audio, video, and leaving the room
    const toggleVideo = () => {
        console.log('Toggling my video state');
        
        // Update local state first
        setPlayers(prevPlayers => {
            if (!prevPlayers[myId]) return prevPlayers;
            
            const updatedPlayers = cloneDeep(prevPlayers);
            const newPlayingState = !updatedPlayers[myId].playing;
            updatedPlayers[myId].playing = newPlayingState;
            
            // Update our ref with the new state
            videoStateRef.current = newPlayingState;
            
            return updatedPlayers;
        });
        
        // Notify other users about the toggle
        socket.emit('user-toggle-video', myId, roomId);
        
        // Also send the explicit state to ensure consistency
        socket.emit('user-video-state', {
            userId: myId,
            roomId: roomId,
            playing: videoStateRef.current
        });
    };
    
    const toggleAudio = () => {
        console.log('Toggling my audio state');
        
        // Update local state
        setPlayers(prevPlayers => {
            if (!prevPlayers[myId]) return prevPlayers;
            
            const updatedPlayers = cloneDeep(prevPlayers);
            updatedPlayers[myId].muted = !updatedPlayers[myId].muted;
            return updatedPlayers;
        });
        
        // Notify other users
        socket.emit('user-toggle-audio', myId, roomId);
    };
    
    const leaveRoom = () => {
        socket.emit('user-leave', myId, roomId);
        console.log('Leaving room', roomId);
        peer?.disconnect();
        router.push('/');
    };    return {
        players, 
        setPlayers, 
        playerHighlighted, 
        nonHighlightedPlayers, 
        toggleAudio, 
        toggleVideo, 
        leaveRoom
    };
};

export default usePlayer;