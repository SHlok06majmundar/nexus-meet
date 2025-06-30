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
                }, 2000); // Increased retry interval
                
                return () => clearTimeout(retryTimer);
            } else {
                console.log("Proceeding without socket after multiple retry attempts");
                // Continue anyway - we'll try to connect the socket later
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
                debug: 1 // Reduced debug level
            });
            setPeer(myPeer)

            myPeer.on('open', (id) => {
                console.log(`your peer id is ${id}`)
                setMyId(id)
                
                // Keep trying to emit join event if socket isn't connected yet
                let joinAttempts = 0;
                const MAX_JOIN_ATTEMPTS = 15; // Try for longer
                
                const emitJoinRoom = () => {
                    joinAttempts++;
                    
                    if (socket) {
                        if (socket.connected) {
                            console.log("Emitting join-room event to socket");
                            socket.emit('join-room', roomId, id, displayName);
                            
                            // Also set up reconnect handler in case socket disconnects later
                            socket.io.on("reconnect", () => {
                                console.log("Socket reconnected, rejoining room");
                                socket.emit('join-room', roomId, id, displayName);
                            });
                            
                        } else if (joinAttempts < MAX_JOIN_ATTEMPTS) {
                            console.log("Socket not connected, waiting 2s before retry... (Attempt " + joinAttempts + ")");
                            setTimeout(emitJoinRoom, 2000);
                        } else {
                            console.warn("Failed to connect socket after maximum attempts");
                        }
                    } else if (joinAttempts < MAX_JOIN_ATTEMPTS) {
                        console.log("Socket not initialized, waiting 2s before retry... (Attempt " + joinAttempts + ")");
                        setTimeout(emitJoinRoom, 2000);
                    } else {
                        console.warn("Failed to initialize socket after maximum attempts");
                    }
                };
                
                // Start the join room process
                emitJoinRoom();
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