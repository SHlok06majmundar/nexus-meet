import {useState, useEffect, useRef} from 'react'

const useMediaStream = () => {
    const [state, setState] = useState(null)
    const isStreamSet = useRef(false)
    const videoTrackRef = useRef(null)

    useEffect(() => {
        if (isStreamSet.current) return;
        isStreamSet.current = true;
        (async function initStream() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true
                })
                console.log("setting your stream")
                // Store the video track reference
                videoTrackRef.current = stream.getVideoTracks()[0]
                setState(stream)
            } catch (e) {
                console.log("Error in media navigator", e)
            }
        })()
    }, [])
    
    // Function to enable/disable video track
    const toggleVideoTrack = (enabled) => {
        if (videoTrackRef.current) {
            videoTrackRef.current.enabled = enabled
            console.log(`Video track is now ${enabled ? 'enabled' : 'disabled'}`)
        }
    }

    return {
        stream: state,
        toggleVideoTrack
    }
}

export default useMediaStream