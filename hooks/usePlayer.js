import {useState} from 'react'
import { cloneDeep } from 'lodash'
import { useSocket } from '@/context/socket'
import { useRouter } from 'next/router'
import { useUser } from "@clerk/nextjs";

const usePlayer = (myId, roomId, peer) => {
    const socket = useSocket()
    const [players, setPlayers] = useState({})
    const router = useRouter()
    const { user } = useUser();
    
    // Get user name from prejoin preferences first, then fallback to Clerk user data
    const getDisplayName = () => {
        // Check if coming from prejoin with stored preferences
        if (typeof window !== 'undefined') {
            const storedPreferences = sessionStorage.getItem('meetingPreferences');
            if (storedPreferences) {
                try {
                    const preferences = JSON.parse(storedPreferences);
                    if (preferences.displayName && preferences.displayName.trim()) {
                        return preferences.displayName.trim();
                    }
                } catch (error) {
                    console.error('Error parsing meeting preferences:', error);
                }
            }
        }
        
        // Fallback to Clerk user data
        if (user?.fullName) return user.fullName;
        if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
        if (user?.firstName) return user.firstName;
        if (user?.username) return user.username;
        
        // Last resort fallback
        return 'Guest User';
    };
    
    const userName = getDisplayName();
    
    const playersCopy = cloneDeep(players)

    const playerHighlighted = playersCopy[myId]
    delete playersCopy[myId]

    const nonHighlightedPlayers = playersCopy

    const leaveRoom = () => {
        socket.emit('user-leave', myId, roomId, userName)
        console.log("leaving room", roomId)
        peer?.disconnect();
        router.push('/')
    }

    const toggleAudio = () => {
        console.log("I toggled my audio")
        setPlayers((prev) => {
            const copy = cloneDeep(prev)
            copy[myId].muted = !copy[myId].muted
            return {...copy}        })
        socket.emit('user-toggle-audio', myId, roomId)
    }
    
    const toggleVideo = () => {
        console.log("I toggled my video")
        
        // Update local state first
        let newVideoState = false
        
        setPlayers((prev) => {
            const copy = cloneDeep(prev)
            // Calculate new state
            newVideoState = !copy[myId].playing
            copy[myId].playing = newVideoState
            return {...copy}
        })
        
        // Emit to other users with explicit video state
        console.log(`Emitting video state: ${newVideoState}`)
        socket.emit('user-toggle-video', myId, roomId, newVideoState)
        
        // Return the new state for external reference
        return newVideoState
    }

    return {
        players, 
        setPlayers, 
        playerHighlighted, 
        nonHighlightedPlayers, 
        toggleAudio, 
        toggleVideo, 
        leaveRoom,
        userName
    }
}

export default usePlayer;