import { useSocket } from "@/context/socket"
import { useRouter } from "next/router"

const { useState, useEffect, useRef } = require("react")

const usePeer = () => {
    const socket = useSocket()
    const roomId = useRouter().query.roomId;
    const [peer, setPeer] = useState(null)
    const [myId, setMyId] = useState('')
    const isPeerSet = useRef(false)

    useEffect(() => {
        if (isPeerSet.current || !roomId || !socket) return;
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
                }
            });
            setPeer(myPeer)

            myPeer.on('open', (id) => {
                console.log(`your peer id is ${id}`)
                setMyId(id)
                socket?.emit('join-room', roomId, id, displayName)
            })
        })()
    }, [roomId, socket])

    return {
        peer,
        myId
    }
}

export default usePeer;