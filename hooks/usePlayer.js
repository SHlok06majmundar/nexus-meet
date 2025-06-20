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
    const userName = user?.fullName || user?.firstName || user?.username || `User ${myId.substring(0, 5)}`;
    
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