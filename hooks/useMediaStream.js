import {useState, useEffect, useRef} from 'react'

const useMediaStream = () => {
    const [state, setState] = useState(null)
    const isStreamSet = useRef(false)
    const videoTrackRef = useRef(null)
    const streamRef = useRef(null)

    useEffect(() => {
        if (isStreamSet.current) return;
        isStreamSet.current = true;
        
        // Initialize the media stream
        initializeStream();
    }, [])
    
    // Function to initialize stream - exposed so it can be called again if needed
    const initializeStream = async () => {
        try {
            console.log("Initializing media stream");
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                    facingMode: "user", // Front camera
                    // Don't apply any mirroring - let the browser show the natural orientation
                    mirror: false
                }
            })
            console.log("Setting your stream")
            
            // Store references
            streamRef.current = stream
            videoTrackRef.current = stream.getVideoTracks()[0]
            
            if (videoTrackRef.current) {
                console.log("Video track obtained:", videoTrackRef.current.label)
                // Ensure video track is enabled by default
                videoTrackRef.current.enabled = true
            }
            
            setState(stream)
            return stream
        } catch (e) {
            console.log("Error in media navigator", e)
            return null
        }
    }
    
    // Function to enable/disable video track with better error handling
    const toggleVideoTrack = async (enabled) => {
        console.log(`Attempting to ${enabled ? 'enable' : 'disable'} video track`)
        
        // If we're disabling, just disable the current track
        if (!enabled && videoTrackRef.current) {
            videoTrackRef.current.enabled = false
            console.log("Video track disabled")
            return true
        }
        
        // If we're enabling and track is ended or doesn't exist, we need to reinitialize
        if (enabled && (!videoTrackRef.current || videoTrackRef.current.readyState === "ended")) {
            console.log("Video track unavailable or ended, reinitializing")
            
            try {
                // Stop any existing video tracks
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => {
                        if (track.kind === 'video') {
                            track.stop()
                        }
                    })
                }
                  // Get a new video stream with same non-mirrored settings
                const newVideoStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user",
                        mirror: false
                    }
                })
                
                const newVideoTrack = newVideoStream.getVideoTracks()[0]
                
                if (newVideoTrack) {
                    // Create a new composite stream with existing audio
                    const newCompositeStream = new MediaStream()
                    
                    // Keep existing audio track if available
                    if (streamRef.current) {
                        const audioTracks = streamRef.current.getAudioTracks()
                        if (audioTracks.length > 0) {
                            newCompositeStream.addTrack(audioTracks[0])
                        }
                    }
                    
                    // Add the new video track
                    newCompositeStream.addTrack(newVideoTrack)
                    
                    // Update references
                    streamRef.current = newCompositeStream
                    videoTrackRef.current = newVideoTrack
                    setState(newCompositeStream)
                    
                    console.log("Successfully reinitialized video track")
                    return true
                }
            } catch (err) {
                console.error("Failed to reinitialize video:", err)
                return false
            }
        } 
        // If we have a working track, just enable it
        else if (videoTrackRef.current) {
            videoTrackRef.current.enabled = true
            console.log("Video track enabled")
            return true
        }
        
        return false
    }
    
    return {
        stream: state,
        toggleVideoTrack,
        initializeStream
    }
}

export default useMediaStream