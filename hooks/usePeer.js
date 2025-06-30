import { useSocket } from "@/context/socket"
import { useRouter } from "next/router"

const { useState, useEffect, useRef } = require("react")

const usePeer = () => {
    const socket = useSocket()
    const roomId = useRouter().query.roomId;
    const [peer, setPeer] = useState(null)
    const [myId, setMyId] = useState('')
    const isPeerSet = useRef(false)
    const socketRetryCount = useRef(0)
    const MAX_RETRIES = 5

    useEffect(() => {
        if (isPeerSet.current || !roomId) return;
        
        // Check for socket availability with retry mechanism
        if (!socket) {
            console.log("Socket not available yet, waiting...", socketRetryCount.current);
            if (socketRetryCount.current < MAX_RETRIES) {
                const retryTimer = setTimeout(() => {
                    socketRetryCount.current += 1;
                    // This will trigger re-render and re-evaluation
                    setPeer(old => old);
                }, 1000); // Retry every second
                
                return () => clearTimeout(retryTimer);
            } else {
                console.error("Failed to connect to socket after multiple attempts");
                return;
            }
        }
        
        // Reset retry count when socket is available
        socketRetryCount.current = 0;
        isPeerSet.current = true;
        let myPeer;
        
        // Get display name from session storage or user preferences
        let displayName = 'Unknown User';
        try {
            if (typeof window !== 'undefined') {
                const storedPreferences = sessionStorage.getItem('meetingPreferences');
                if (storedPreferences) {
                    const preferences = JSON.parse(storedPreferences);
                    if (preferences.displayName && preferences.displayName.trim()) {
                        displayName = preferences.displayName.trim();
                    }
                }
            }
        } catch (e) {
            console.error("Error getting display name", e);
        }
        
        (async function initPeer() {
            // Configure PeerJS with metadata to include username
            myPeer = new (await import('peerjs')).default({
                metadata: {
                    userName: displayName
                },
                debug: 2 // Add debug option to help troubleshooting
            });
            setPeer(myPeer)

            myPeer.on('open', (id) => {
                console.log(`your peer id is ${id}`)
                setMyId(id)
                if (socket && socket.connected) {
                    console.log("Emitting join-room event to socket");
                    socket.emit('join-room', roomId, id, displayName);
                } else {
                    console.error("Socket disconnected, cannot join room");
                }
            })
            
            myPeer.on('error', (err) => {
                console.error('PeerJS error:', err);
            });
        })()
    }, [roomId, socket])

    return {
        peer,
        myId
    }
}

export default usePeer;