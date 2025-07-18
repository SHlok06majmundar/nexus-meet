import React, { useEffect, useState } from "react";
import { useRef } from "react";

import { useNavigate, useParams } from "react-router-dom";

// icons
import { IoChatboxOutline as ChatIcon } from "react-icons/io5";
import { VscTriangleDown as DownIcon } from "react-icons/vsc";
import { FaUsers as UsersIcon } from "react-icons/fa";
import { FiSend as SendIcon } from "react-icons/fi";
import { FcGoogle as GoogleIcon } from "react-icons/fc";
import { MdClear as ClearIcon } from "react-icons/md";
import { AiOutlineLink as LinkIcon } from "react-icons/ai";
import { MdOutlineContentCopy as CopyToClipboardIcon } from "react-icons/md";
// import { MdScreenShare as ScreenShareIcon } from "react-icons/md";
import { IoVideocamSharp as VideoOnIcon } from "react-icons/io5";
import { IoVideocamOff as VideoOffIcon } from "react-icons/io5";
import { AiOutlineShareAlt as ShareIcon } from "react-icons/ai";
import { IoMic as MicOnIcon } from "react-icons/io5";
import { IoMicOff as MicOffIcon } from "react-icons/io5";
import { BsPin as PinIcon } from "react-icons/bs";
import { BsPinFill as PinActiveIcon } from "react-icons/bs";
import { FaRecordVinyl as RecordIcon } from "react-icons/fa";
import { MdStop as StopRecordIcon } from "react-icons/md";
import { MdDownload as DownloadIcon } from "react-icons/md";
import { RiRecordCircleFill as RecordingIcon } from "react-icons/ri";
import { MdExitToApp as LeaveIcon } from "react-icons/md";
import { FaRobot as AIIcon } from "react-icons/fa";
import { BsFillMicFill as TranscribeIcon } from "react-icons/bs";
import { MdTranslate as TranslateIcon } from "react-icons/md";
import { FaFilePdf as PDFIcon } from "react-icons/fa";
import { IoMdMic as MicActiveIcon } from "react-icons/io";
import { HiSparkles as SparklesIcon } from "react-icons/hi";
import { MdLanguage as LanguageIcon } from "react-icons/md";

import { QRCode } from "react-qrcode-logo";
import MeetGridCard from "../components/MeetGridCard";

// framer motion
import { motion, AnimatePresence } from "framer-motion";

// importing audios
import joinSFX from "../sounds/join.mp3";
import msgSFX from "../sounds/message.mp3";
import leaveSFX from "../sounds/leave.mp3";

// simple peer
import Peer from "simple-peer";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

const Room = () => {
  const [loading, setLoading] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [showChat, setshowChat] = useState(true);
  const [share, setShare] = useState(false);
  const [joinSound] = useState(new Audio(joinSFX));
  const { roomID } = useParams();
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const recordingIntervalRef = useRef(null);
  const canvasRef = useRef(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  
  // AI Transcription states
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [transcriptionLanguage, setTranscriptionLanguage] = useState('en-US');
  const [showTranscription, setShowTranscription] = useState(false);
  const [aiFeatureActive, setAiFeatureActive] = useState(false);
  const [voiceActivityDetection, setVoiceActivityDetection] = useState(null);
  const transcriptionScrollRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [activeSpeakers, setActiveSpeakers] = useState(new Set());
  const [sidebarTab, setSidebarTab] = useState('chat'); // 'chat' or 'transcription'
  
  const chatScroll = useRef();
  const [pin, setPin] = useState(false);
  const [peers, setPeers] = useState([]);
  const socket = useRef();
  const peersRef = useRef([]);

  const [videoActive, setVideoActive] = useState(true);

  const [msgs, setMsgs] = useState([]);
  const [msgText, setMsgText] = useState("");
  const localVideo = useRef();

  // user
  const { user, login } = useAuth();

  const [particpentsOpen, setParticpentsOpen] = useState(true);

  const sendMessage = (e) => {
    e.preventDefault();
    if (msgText) {
      socket.current.emit("send message", {
        roomID,
        from: socket.current.id,
        user: {
          id: user.uid,
          name: user?.displayName,
          profilePic: user.photoURL,
        },
        message: msgText.trim(),
      });
    }
    setMsgText("");
  };

  // Test connection function
  const testConnection = () => {
    console.log("🧪 Testing connection...");
    console.log("Backend URL:", process.env.REACT_APP_SOCKET_BACKEND_URL);
    console.log("Socket connected:", socket.current?.connected);
    console.log("Socket ID:", socket.current?.id);
    console.log("Room ID:", roomID);
    console.log("User:", user?.displayName);
    console.log("Peers count:", Object.keys(peersRef.current).length);
    console.log("All peers:", Object.keys(peersRef.current));
  };

  useEffect(() => {
    const unsub = () => {
      const backendUrl = process.env.REACT_APP_SOCKET_BACKEND_URL || "http://localhost:5000";
      console.log("🔗 Connecting to backend:", backendUrl);
      console.log("🏠 Room ID:", roomID);
      console.log("👤 User:", user?.displayName);
      
      socket.current = io.connect(backendUrl, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true
      });
      
      socket.current.on("connect", () => {
        console.log("Socket connected:", socket.current.id);
      });
      
      socket.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });
      
      socket.current.on("message", (data) => {
        const audio = new Audio(msgSFX);
        if (user?.uid !== data.user.id) {
          console.log("send");
          audio.play();
        }
        const msg = {
          send: user?.uid === data.user.id,
          ...data,
        };
        setMsgs((msgs) => [...msgs, msg]);
        // setMsgs(data);
        // console.log(data);
      });
      if (user)
        navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: true,
          })
          .then((stream) => {
            setLoading(false);
            setLocalStream(stream);
            localVideo.current.srcObject = stream;
            
            // Add socket event listeners
            socket.current.on("connect", () => {
              console.log("✅ Socket connected successfully");
              console.log("📡 Socket ID:", socket.current.id);
              setDebugInfo(prev => ({
                ...prev,
                socketConnected: true,
                socketId: socket.current.id
              }));
            });

            socket.current.on("connect_error", (error) => {
              console.error("❌ Socket connection error:", error);
              setDebugInfo(prev => ({
                ...prev,
                socketConnected: false,
                error: error.message
              }));
            });

            socket.current.on("disconnect", (reason) => {
              console.log("🔌 Socket disconnected:", reason);
              setDebugInfo(prev => ({
                ...prev,
                socketConnected: false
              }));
            });
            
            socket.current.emit("join room", {
              roomID,
              user: user
                ? {
                    uid: user?.uid,
                    email: user?.email,
                    name: user?.displayName,
                    photoURL: user?.photoURL,
                  }
                : null,
            });
            console.log("📤 Emitted join room for:", user?.displayName, "in room:", roomID);
            socket.current.on("all users", (users) => {
              console.log("Received all users:", users);
              console.log("Current room ID:", roomID);
              const peers = [];
              users.forEach((user) => {
                console.log("Creating peer for user:", user.user?.name);
                const peer = createPeer(user.userId, socket.current.id, stream);
                peersRef.current.push({
                  peerID: user.userId,
                  peer,
                  user: user.user,
                });
                peers.push({
                  peerID: user.userId,
                  peer,
                  user: user.user,
                });
              });
              console.log("Setting peers:", peers.length);
              setPeers(peers);
            });

            socket.current.on("user joined", (payload) => {
              console.log("New user joined:", payload.user?.name);
              const peer = addPeer(payload.signal, payload.callerID, stream);
              peersRef.current.push({
                peerID: payload.callerID,
                peer,
                user: payload.user,
              });

              const peerObj = {
                peerID: payload.callerID,
                peer,
                user: payload.user,
              };

              setPeers((users) => [...users, peerObj]);
              console.log("Peers updated, total:", peersRef.current.length);
            });

            socket.current.on("receiving returned signal", (payload) => {
              const item = peersRef.current.find(
                (p) => p.peerID === payload.id
              );
              item.peer.signal(payload.signal);
            });

            socket.current.on("user left", (id) => {
              console.log("User left:", id);
              const audio = new Audio(leaveSFX);
              audio.play();
              const peerObj = peersRef.current.find((p) => p.peerID === id);
              if (peerObj) {
                console.log("Destroying peer:", id);
                peerObj.peer.destroy();
              }
              const peers = peersRef.current.filter((p) => p.peerID !== id);
              peersRef.current = peers;
              setPeers((users) => users.filter((p) => p.peerID !== id));
              console.log("Remaining peers:", peers.length);
            });
          });
    };
    return unsub();
  }, [user, roomID]);

  const createPeer = (userToSignal, callerID, stream) => {
    console.log("Creating peer connection to:", userToSignal);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      console.log("Sending signal to:", userToSignal);
      socket.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
        user: user
          ? {
              uid: user?.uid,
              email: user?.email,
              name: user?.displayName,
              photoURL: user?.photoURL,
            }
          : null,
      });
    });

    peer.on("connect", () => {
      console.log("Peer connected to:", userToSignal);
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
    });

    return peer;
  };

  const addPeer = (incomingSignal, callerID, stream) => {
    console.log("Adding peer from:", callerID);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });
    
    peer.on("signal", (signal) => {
      console.log("Returning signal to:", callerID);
      socket.current.emit("returning signal", { signal, callerID });
    });
    
    peer.on("connect", () => {
      console.log("Peer connected from:", callerID);
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
    });
    
    joinSound.play();
    peer.signal(incomingSignal);
    return peer;
  };

  // Recording functions
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const createCombinedStream = async () => {
    try {
      // Create a canvas to composite all video streams
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      
      // Set up canvas reference
      if (!canvasRef.current) {
        canvasRef.current = canvas;
      }
      
      // Function to draw all videos on canvas
      const drawVideos = () => {
        if (!isRecording) return;
        
        // Clear canvas
        ctx.fillStyle = '#0d1117'; // Match app background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Get all video elements
        const videos = [];
        
        // Add local video
        if (localVideo.current && localVideo.current.videoWidth > 0) {
          videos.push({
            element: localVideo.current,
            name: user?.displayName + ' (You)',
            isLocal: true
          });
        }
        
        // Add peer videos
        const peerVideoElements = document.querySelectorAll('[data-peer-video]');
        peerVideoElements.forEach((video, index) => {
          if (video.videoWidth > 0) {
            const peerData = peers[index];
            videos.push({
              element: video,
              name: peerData?.user?.name || `Participant ${index + 1}`,
              isLocal: false
            });
          }
        });
        
        // Calculate grid layout
        const videoCount = videos.length;
        if (videoCount === 0) {
          requestAnimationFrame(drawVideos);
          return;
        }
        
        const cols = Math.ceil(Math.sqrt(videoCount));
        const rows = Math.ceil(videoCount / cols);
        const videoWidth = canvas.width / cols;
        const videoHeight = canvas.height / rows;
        
        // Draw each video
        videos.forEach((videoData, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = col * videoWidth;
          const y = row * videoHeight;
          
          try {
            // Draw video frame
            ctx.drawImage(videoData.element, x, y, videoWidth, videoHeight);
            
            // Draw name label
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(x + 10, y + videoHeight - 40, ctx.measureText(videoData.name).width + 20, 30);
            
            ctx.fillStyle = 'white';
            ctx.font = '16px Inter, sans-serif';
            ctx.fillText(videoData.name, x + 20, y + videoHeight - 20);
            
            // Draw border
            ctx.strokeStyle = videoData.isLocal ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, videoWidth, videoHeight);
            
          } catch (error) {
            console.warn('Error drawing video:', error);
          }
        });
        
        // Draw recording indicator
        const now = Date.now();
        const opacity = Math.sin(now / 500) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(239, 68, 68, ${opacity})`;
        ctx.beginPath();
        ctx.arc(canvas.width - 30, 30, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillText('REC', canvas.width - 70, 37);
        
        // Draw timestamp
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width - 120, 50, 110, 25);
        ctx.fillStyle = 'white';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(formatTime(recordingTime), canvas.width - 115, 67);
        
        requestAnimationFrame(drawVideos);
      };
      
      // Start drawing loop
      drawVideos();
      
      // Get canvas stream
      const canvasStream = canvas.captureStream(30);
      
      // Create audio context to mix all audio
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();
      
      // Add local audio
      if (localStream && localStream.getAudioTracks().length > 0) {
        try {
          const localAudioSource = audioContext.createMediaStreamSource(localStream);
          localAudioSource.connect(destination);
        } catch (error) {
          console.warn('Could not add local audio:', error);
        }
      }
      
      // Add peer audio - this will record all participants' audio
      peers.forEach(peer => {
        if (peer.peer && peer.peer.remoteStream && peer.peer.remoteStream.getAudioTracks().length > 0) {
          try {
            const peerAudioSource = audioContext.createMediaStreamSource(peer.peer.remoteStream);
            // Create gain node to control volume if needed
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 1.0; // Full volume for peer audio
            peerAudioSource.connect(gainNode);
            gainNode.connect(destination);
            
            console.log(`Added peer audio: ${peer.user?.name || 'Unknown'}`);
          } catch (error) {
            console.warn('Could not add peer audio:', error);
          }
        }
      });
      
      // Combine video and audio
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
      ]);
      
      return combinedStream;
      
    } catch (error) {
      console.error('Error creating combined stream:', error);
      // Fallback to screen capture
      try {
        console.log('Falling back to screen capture...');
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            mediaSource: 'screen',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: true
        });
        
        return screenStream;
      } catch (screenError) {
        console.error('Screen capture also failed:', screenError);
        return localStream ? localStream.clone() : null;
      }
    }
  };

  // Simple recording function as fallback
  const startSimpleRecording = async () => {
    try {
      console.log('Starting simple recording of local stream...');
      
      if (!localStream) {
        throw new Error('No local stream available');
      }

      // Clone the local stream for recording
      const recordingStream = localStream.clone();
      
      // Check MediaRecorder support
      let options = {};
      
      const supportedTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus', 
        'video/webm',
        'video/mp4'
      ];
      
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          options.mimeType = type;
          break;
        }
      }
      
      console.log('Using recording options:', options);
      
      const recorder = new MediaRecorder(recordingStream, options);
      const chunks = [];
      
      recorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size);
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstart = () => {
        console.log('Simple recording started successfully');
        setIsRecording(true);
        setRecordingStartTime(Date.now());
        setRecordingTime(0);
        
        // Start recording timer
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      };
      
      recorder.onstop = () => {
        console.log('Simple recording stopped, chunks:', chunks.length);
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { 
            type: options.mimeType || 'video/webm' 
          });
          console.log('Created blob:', blob.size, 'bytes');
          setRecordedBlob(blob);
          setRecordedChunks(chunks);
        }
        
        // Clear timer
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      };
      
      recorder.onerror = (event) => {
        console.error('Simple recording error:', event.error);
        setIsRecording(false);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        alert('Recording failed: ' + event.error.message);
      };
      
      // Start recording
      recorder.start(1000);
      setMediaRecorder(recorder);
      
      console.log('Simple MediaRecorder created and started');
      
    } catch (error) {
      console.error('Error starting simple recording:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      if (!localStream) {
        alert('No local stream available. Please check your camera and microphone permissions.');
        return;
      }

      console.log('Starting recording...');
      
      // Ask user for recording preference
      const recordingMethod = await new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm';
        modal.innerHTML = `
          <div class="glass border border-neutral-800/50 rounded-2xl p-6 w-full max-w-md mx-4 text-white">
            <h3 class="text-lg font-semibold mb-4">Choose Recording Method</h3>
            <div class="space-y-3">
              <button id="screen-record" class="w-full p-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-left transition-colors">
                <div class="font-medium">Screen Recording (Recommended)</div>
                <div class="text-sm text-neutral-300">Records entire meeting view with all participants</div>
              </button>
              <button id="auto-record" class="w-full p-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-left transition-colors">
                <div class="font-medium">Auto Composite</div>
                <div class="text-sm text-neutral-300">Automatically combines all video streams</div>
              </button>
            </div>
          </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#screen-record').onclick = () => {
          document.body.removeChild(modal);
          resolve('screen');
        };
        
        modal.querySelector('#auto-record').onclick = () => {
          document.body.removeChild(modal);
          resolve('auto');
        };
      });
      
      let recordingStream;
      
      if (recordingMethod === 'screen') {
        // Use screen capture
        try {
          console.log('Starting screen recording...');
          recordingStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              mediaSource: 'screen',
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 30 }
            },
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false
            }
          });
          
          // Add local microphone audio to the recording
          if (localStream.getAudioTracks().length > 0) {
            const audioContext = new AudioContext();
            const destination = audioContext.createMediaStreamDestination();
            
            // Add screen audio if available
            if (recordingStream.getAudioTracks().length > 0) {
              const screenAudioSource = audioContext.createMediaStreamSource(recordingStream);
              screenAudioSource.connect(destination);
            }
            
            // Add local microphone
            const micSource = audioContext.createMediaStreamSource(localStream);
            micSource.connect(destination);
            
            // Replace audio tracks
            recordingStream.getAudioTracks().forEach(track => {
              recordingStream.removeTrack(track);
            });
            
            destination.stream.getAudioTracks().forEach(track => {
              recordingStream.addTrack(track);
            });
          }
          
        } catch (screenError) {
          console.warn('Screen recording failed, falling back to auto composite:', screenError);
          recordingStream = await createCombinedStream();
        }
      } else {
        // Use auto composite method
        recordingStream = await createCombinedStream();
      }
      
      if (!recordingStream) {
        throw new Error('Failed to create recording stream');
      }

      // Check MediaRecorder support and choose best format
      let options = {};
      
      const supportedTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus', 
        'video/webm;codecs=h264,opus',
        'video/webm',
        'video/mp4'
      ];
      
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          options.mimeType = type;
          break;
        }
      }
      
      // Set higher quality bitrates
      if (options.mimeType) {
        options.videoBitsPerSecond = 2500000; // 2.5 Mbps for better quality
        options.audioBitsPerSecond = 128000;  // 128 kbps
      }
      
      console.log('Using recording options:', options);
      
      const recorder = new MediaRecorder(recordingStream, options);
      const chunks = [];
      
      recorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size);
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstart = () => {
        console.log('Recording started successfully');
        setIsRecording(true);
        setRecordingStartTime(Date.now());
        setRecordingTime(0);
        
        // Start recording timer
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      };
      
      recorder.onstop = () => {
        console.log('Recording stopped, chunks:', chunks.length);
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { 
            type: options.mimeType || 'video/webm' 
          });
          console.log('Created blob:', blob.size, 'bytes');
          setRecordedBlob(blob);
          setRecordedChunks(chunks);
        }
        
        // Stop all tracks in the recording stream
        recordingStream.getTracks().forEach(track => {
          track.stop();
        });
        
        // Clear timer
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      };
      
      recorder.onerror = (event) => {
        console.error('Recording error:', event.error);
        setIsRecording(false);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        alert('Recording failed: ' + event.error.message);
      };
      
      // Handle screen share stop (when user stops sharing manually)
      if (recordingMethod === 'screen') {
        recordingStream.getVideoTracks()[0].addEventListener('ended', () => {
          console.log('Screen sharing ended by user');
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        });
      }
      
      // Start recording with smaller time slices for better reliability
      recorder.start(500);
      setMediaRecorder(recorder);
      
      console.log('MediaRecorder created and started');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to start recording. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow screen recording and microphone permissions.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Recording is not supported in this browser. Please use Chrome or Firefox.';
      } else if (error.name === 'AbortError') {
        errorMessage += 'Recording was cancelled by user.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      alert(errorMessage);
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    
    if (mediaRecorder) {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        console.log('MediaRecorder stopped');
      } else {
        console.log('MediaRecorder state:', mediaRecorder.state);
      }
    }
    
    setIsRecording(false);
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
      console.log('Recording timer cleared');
    }
  };

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexus-meeting-${roomID}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Reset recording state
      setRecordedBlob(null);
      setRecordedChunks([]);
      setRecordingTime(0);
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setRecordedChunks([]);
    setRecordingTime(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      if (speechRecognition) {
        speechRecognition.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [mediaRecorder, speechRecognition]);

  // AI Transcription Functions
  const initializeAudioAnalysis = async () => {
    try {
      if (!localStream) return;

      // Create audio context for voice activity detection
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      // Connect local stream to analyser
      const source = audioContext.createMediaStreamSource(localStream);
      source.connect(analyser);
      
      // Start voice activity detection
      startVoiceActivityDetection();
      
    } catch (error) {
      console.error('Error initializing audio analysis:', error);
    }
  };

  const startVoiceActivityDetection = () => {
    if (!analyserRef.current) return;
    
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const detectVoiceActivity = () => {
      if (!isTranscribing) return;
      
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      
      // Voice activity threshold
      const threshold = 30;
      const isSpeaking = average > threshold;
      
      if (isSpeaking && !activeSpeakers.has(user?.uid)) {
        setActiveSpeakers(prev => new Set([...prev, user?.uid]));
        setCurrentSpeaker({
          id: user?.uid,
          name: user?.displayName,
          photoURL: user?.photoURL
        });
      } else if (!isSpeaking && activeSpeakers.has(user?.uid)) {
        setActiveSpeakers(prev => {
          const newSet = new Set(prev);
          newSet.delete(user?.uid);
          return newSet;
        });
        if (currentSpeaker?.id === user?.uid) {
          setCurrentSpeaker(null);
        }
      }
      
      requestAnimationFrame(detectVoiceActivity);
    };
    
    detectVoiceActivity();
  };

  const initializeSpeechRecognition = () => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return null;
    }
    
    const recognition = new SpeechRecognition();
    
    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = transcriptionLanguage;
    recognition.maxAlternatives = 1;
    
    // Handle recognition results
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        addTranscription({
          id: Date.now(),
          speaker: currentSpeaker || {
            id: user?.uid,
            name: user?.displayName,
            photoURL: user?.photoURL
          },
          text: finalTranscript.trim(),
          timestamp: new Date(),
          confidence: event.results[event.results.length - 1][0].confidence || 0.8,
          language: transcriptionLanguage,
          isInterim: false
        });
      }
      
      // Update interim transcript for real-time display
      if (interimTranscript && currentSpeaker) {
        updateInterimTranscript(interimTranscript, currentSpeaker);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'network') {
        console.log('Network error, attempting to restart...');
        setTimeout(() => {
          if (isTranscribing) {
            recognition.start();
          }
        }, 1000);
      }
    };
    
    recognition.onend = () => {
      console.log('Speech recognition ended');
      // Restart if still transcribing
      if (isTranscribing) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (error) {
            console.warn('Error restarting speech recognition:', error);
          }
        }, 100);
      }
    };
    
    return recognition;
  };

  const addTranscription = (transcription) => {
    setTranscriptions(prev => {
      // Remove any interim transcriptions from the same speaker
      const filtered = prev.filter(t => !(t.isInterim && t.speaker.id === transcription.speaker.id));
      
      // Add the new transcription
      const updated = [...filtered, transcription].slice(-100); // Keep last 100 transcriptions
      
      // Auto-scroll to bottom
      setTimeout(() => {
        if (transcriptionScrollRef.current) {
          transcriptionScrollRef.current.scrollTop = transcriptionScrollRef.current.scrollHeight;
        }
      }, 100);
      
      return updated;
    });
  };

  const updateInterimTranscript = (text, speaker) => {
    setTranscriptions(prev => {
      const filtered = prev.filter(t => !(t.isInterim && t.speaker.id === speaker.id));
      
      if (text.trim()) {
        return [...filtered, {
          id: `interim-${speaker.id}`,
          speaker,
          text: text.trim(),
          timestamp: new Date(),
          confidence: 0.5,
          language: transcriptionLanguage,
          isInterim: true
        }];
      }
      
      return filtered;
    });
  };

  const startAITranscription = async () => {
    try {
      if (!localStream) {
        alert('Please enable your microphone to use AI transcription.');
        return;
      }
      
      // Initialize audio analysis
      await initializeAudioAnalysis();
      
      // Initialize speech recognition
      const recognition = initializeSpeechRecognition();
      if (!recognition) return;
      
      setSpeechRecognition(recognition);
      
      // Start recognition
      recognition.start();
      console.log('Speech recognition started');
      
      setIsTranscribing(true);
      setAiFeatureActive(true);
      setShowTranscription(true);
      
      // Add initial system message
      addTranscription({
        id: Date.now(),
        speaker: {
          id: 'system',
          name: 'AI Assistant',
          photoURL: null
        },
        text: 'AI transcription started. All participants\' speech will be converted to text in real-time.',
        timestamp: new Date(),
        confidence: 1.0,
        language: transcriptionLanguage,
        isInterim: false,
        isSystem: true
      });
      
    } catch (error) {
      console.error('Error starting AI transcription:', error);
      alert('Failed to start AI transcription: ' + error.message);
    }
  };

  const stopAITranscription = () => {
    if (speechRecognition) {
      speechRecognition.stop();
      setSpeechRecognition(null);
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsTranscribing(false);
    setAiFeatureActive(false);
    setCurrentSpeaker(null);
    setActiveSpeakers(new Set());
    
    // Add final system message
    addTranscription({
      id: Date.now(),
      speaker: {
        id: 'system',
        name: 'AI Assistant',
        photoURL: null
      },
      text: 'AI transcription stopped.',
      timestamp: new Date(),
      confidence: 1.0,
      language: transcriptionLanguage,
      isInterim: false,
      isSystem: true
    });
    
    console.log('AI transcription stopped');
  };

  const downloadTranscription = () => {
    const transcriptText = transcriptions
      .filter(t => !t.isInterim && !t.isSystem)
      .map(t => {
        const time = t.timestamp.toLocaleTimeString();
        return `[${time}] ${t.speaker.name}: ${t.text}`;
      })
      .join('\n');
    
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-meeting-transcript-${roomID}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTranscriptionAsPDF = async () => {
    // Install jsPDF: npm install jspdf
    try {
      // Dynamic import for jsPDF to reduce bundle size
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 7;
      let yPos = margin;
      
      // Header
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Nexus Meet - Meeting Transcript', margin, yPos);
      yPos += lineHeight * 2;
      
      // Meeting info
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Room ID: ${roomID}`, margin, yPos);
      yPos += lineHeight;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPos);
      yPos += lineHeight;
      doc.text(`Time: ${new Date().toLocaleTimeString()}`, margin, yPos);
      yPos += lineHeight * 2;
      
      // Participants
      doc.setFont(undefined, 'bold');
      doc.text('Participants:', margin, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');
      
      const participants = new Set();
      transcriptions.forEach(t => {
        if (!t.isSystem && t.speaker.name) {
          participants.add(t.speaker.name);
        }
      });
      
      participants.forEach(name => {
        doc.text(`• ${name}`, margin + 5, yPos);
        yPos += lineHeight;
      });
      yPos += lineHeight;
      
      // Transcription content
      doc.setFont(undefined, 'bold');
      doc.text('Transcript:', margin, yPos);
      yPos += lineHeight * 1.5;
      doc.setFont(undefined, 'normal');
      
      const filteredTranscriptions = transcriptions.filter(t => !t.isInterim && !t.isSystem);
      
      filteredTranscriptions.forEach((transcription, index) => {
        if (yPos > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        
        const time = transcription.timestamp.toLocaleTimeString();
        const speaker = transcription.speaker.name || 'Unknown';
        const text = transcription.text || '';
        
        // Speaker and time
        doc.setFont(undefined, 'bold');
        doc.setFontSize(9);
        const speakerText = `[${time}] ${speaker}:`;
        doc.text(speakerText, margin, yPos);
        yPos += lineHeight;
        
        // Message text with word wrapping
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        const maxWidth = pageWidth - (margin * 2);
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach(line => {
          if (yPos > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
          }
          doc.text(line, margin + 5, yPos);
          yPos += lineHeight;
        });
        
        yPos += lineHeight * 0.5; // Space between messages
      });
      
      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
        doc.text('Generated by Nexus Meet', margin, pageHeight - 10);
      }
      
      // Save the PDF
      const fileName = `nexus-meeting-transcript-${roomID}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try downloading as text instead.');
    }
  };

  const clearTranscription = () => {
    setTranscriptions([]);
  };

  // Language options for transcription
  const languageOptions = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳' },
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' }
  ];

  return (
    <>
      {/* Hidden canvas for recording */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Debug Panel - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
          <div className="font-bold mb-2">Debug Info:</div>
          <div>Room ID: {roomID}</div>
          <div>Socket Connected: {socket.current?.connected ? '✅' : '❌'}</div>
          <div>Socket ID: {socket.current?.id || 'None'}</div>
          <div>Peers Count: {peers.length}</div>
          <div>User: {user?.displayName || 'Not logged in'}</div>
          <div>Backend URL: {process.env.REACT_APP_SOCKET_BACKEND_URL || 'localhost:5000'}</div>
          <button 
            onClick={testConnection}
            className="mt-2 bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
          >
            Test Connection
          </button>
          {peers.length > 0 && (
            <div className="mt-2">
              <div className="font-semibold">Peers:</div>
              {peers.map((peer, index) => (
                <div key={index}>• {peer.user?.name || 'Unknown'}</div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {user ? (
        <AnimatePresence>
          {loading ? (
            <div className="bg-neutral-900 min-h-screen">
              <Loading />
            </div>
          ) : (
            user && (
              <motion.div
                layout
                className="flex flex-row bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white w-full min-h-screen"
              >
                <motion.div
                  layout
                  className="flex flex-col justify-between w-full"
                >
                  {/* Recording Status Indicator */}
                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-600/90 backdrop-blur-sm border border-red-500/50 m-4 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center gap-2">
                          <RecordingIcon className="text-white text-lg animate-pulse" />
                          <span className="text-white font-medium">Recording in Progress</span>
                        </div>
                        <div className="text-white/80 text-sm flex items-center gap-2">
                          <span>{formatTime(recordingTime)}</span>
                          <span>•</span>
                          <span>{peers.length + 1} participants</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* AI Transcription Status Indicator */}
                  {isTranscribing && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-purple-600/90 backdrop-blur-sm border border-purple-500/50 mx-4 mb-4 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center gap-2">
                          <SparklesIcon className="text-white text-lg animate-pulse" />
                          <span className="text-white font-medium">AI Transcription Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentSpeaker && (
                            <>
                              <MicActiveIcon className="text-white text-sm animate-pulse" />
                              <span className="text-white/80 text-sm">{currentSpeaker.name}</span>
                            </>
                          )}
                          <div className="text-white/60 text-xs">
                            {languageOptions.find(l => l.code === transcriptionLanguage)?.flag}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Video Grid Area */}
                  <div
                    className="flex-shrink-0 overflow-y-auto p-6"
                    style={{
                      height: "calc(100vh - 88px)",
                    }}
                  >
                    <motion.div
                      layout
                      className={`grid gap-4 ${
                        showChat
                          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
                          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      }`}
                    >
                      {/* Local Video */}
                      <motion.div
                        layout
                        className={`relative glass rounded-2xl aspect-video overflow-hidden border border-neutral-800/50 group ${
                          pin &&
                          "md:col-span-2 md:row-span-2 md:col-start-1 md:row-start-1"
                        }`}
                      >
                        {/* Pin Button */}
                        <div className="absolute top-4 right-4 z-20">
                          <button
                            className={`${
                              pin
                                ? "bg-primary-600 border-primary-500"
                                : "glass border-neutral-700"
                            } border-2 p-2.5 cursor-pointer rounded-xl text-white text-lg transition-all duration-200 hover:scale-110`}
                            onClick={() => setPin(!pin)}
                            title={pin ? "Unpin video" : "Pin video"}
                          >
                            {pin ? <PinActiveIcon /> : <PinIcon />}
                          </button>
                        </div>

                        {/* Video Element */}
                        <video
                          ref={localVideo}
                          muted
                          autoPlay
                          controls={false}
                          className="h-full w-full object-cover rounded-2xl"
                        />
                        
                        {/* Video Off Overlay */}
                        {!videoActive && (
                          <div className="absolute inset-0 glass flex items-center justify-center rounded-2xl">
                            <div className="text-center space-y-4">
                              <img
                                className="h-24 w-24 rounded-full object-cover mx-auto ring-4 ring-primary-500/30"
                                src={user?.photoURL}
                                alt={user?.displayName}
                              />
                              <p className="text-neutral-300 font-medium">{user?.displayName}</p>
                            </div>
                          </div>
                        )}

                        {/* User Name Badge */}
                        <div className="absolute bottom-4 left-4">
                          <div className="glass px-3 py-1.5 rounded-lg text-white text-sm font-medium border border-neutral-700/50">
                            {user?.displayName} (You)
                          </div>
                        </div>
                      </motion.div>

                      {/* Remote Videos */}
                      {peers.map((peer) => (
                        <MeetGridCard
                          key={peer?.peerID}
                          user={peer.user}
                          peer={peer?.peer}
                        />
                      ))}
                    </motion.div>
                  </div>

                  {/* Bottom Controls */}
                  <div className="h-24 glass border-t border-neutral-800/50 p-4">
                    <div className="flex items-center justify-between max-w-6xl mx-auto">
                      {/* Left Controls */}
                      <div className="flex gap-3">
                        {/* Microphone */}
                        <button
                          className={`${
                            micOn
                              ? "bg-primary-600 border-primary-500 shadow-glow"
                              : "glass border-neutral-700 hover:border-red-500"
                          } border-2 p-3 cursor-pointer rounded-xl text-white text-xl transition-all duration-200 hover:scale-105`}
                          onClick={() => {
                            const audio =
                              localVideo.current.srcObject.getAudioTracks()[0];
                            if (micOn) {
                              audio.enabled = false;
                              setMicOn(false);
                            }
                            if (!micOn) {
                              audio.enabled = true;
                              setMicOn(true);
                            }
                          }}
                          title={micOn ? "Mute microphone" : "Unmute microphone"}
                        >
                          {micOn ? <MicOnIcon /> : <MicOffIcon />}
                        </button>

                        {/* Camera */}
                        <button
                          className={`${
                            videoActive
                              ? "bg-primary-600 border-primary-500 shadow-glow"
                              : "glass border-neutral-700 hover:border-red-500"
                          } border-2 p-3 cursor-pointer rounded-xl text-white text-xl transition-all duration-200 hover:scale-105`}
                          onClick={() => {
                            const videoTrack = localStream
                              .getTracks()
                              .find((track) => track.kind === "video");
                            if (videoActive) {
                              videoTrack.enabled = false;
                            } else {
                              videoTrack.enabled = true;
                            }
                            setVideoActive(!videoActive);
                          }}
                          title={videoActive ? "Turn off camera" : "Turn on camera"}
                        >
                          {videoActive ? <VideoOnIcon /> : <VideoOffIcon />}
                        </button>

                        {/* Recording Controls */}
                        {!isRecording && !recordedBlob && (
                          <button
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-2 border-red-500 p-3 cursor-pointer rounded-xl text-white text-xl transition-all duration-200 hover:scale-105 shadow-glow"
                            onClick={startRecording}
                            title="Start recording meeting"
                          >
                            <RecordIcon />
                          </button>
                        )}

                        {isRecording && (
                          <button
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-2 border-red-500 p-3 cursor-pointer rounded-xl text-white text-xl transition-all duration-200 hover:scale-105 shadow-glow animate-pulse"
                            onClick={stopRecording}
                            title="Stop recording"
                          >
                            <StopRecordIcon />
                          </button>
                        )}

                        {recordedBlob && (
                          <div className="flex gap-2">
                            <button
                              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-2 border-green-500 p-3 cursor-pointer rounded-xl text-white text-xl transition-all duration-200 hover:scale-105 shadow-glow"
                              onClick={downloadRecording}
                              title="Download recording"
                            >
                              <DownloadIcon />
                            </button>
                            <button
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-2 border-blue-500 p-3 cursor-pointer rounded-xl text-white text-xl transition-all duration-200 hover:scale-105 shadow-glow"
                              onClick={() => {
                                resetRecording();
                                startRecording();
                              }}
                              title="Record again"
                            >
                              <RecordIcon />
                            </button>
                          </div>
                        )}

                        {/* AI Transcription Controls */}
                        {!isTranscribing && (
                          <button
                            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 border-2 border-purple-500 p-3 cursor-pointer rounded-xl text-white text-xl transition-all duration-200 hover:scale-105 shadow-glow"
                            onClick={startAITranscription}
                            title="Start AI transcription"
                          >
                            <AIIcon />
                          </button>
                        )}

                        {isTranscribing && (
                          <button
                            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 border-2 border-purple-500 p-3 cursor-pointer rounded-xl text-white text-xl transition-all duration-200 hover:scale-105 shadow-glow animate-pulse"
                            onClick={stopAITranscription}
                            title="Stop AI transcription"
                          >
                            <TranscribeIcon />
                          </button>
                        )}
                      </div>

                      {/* Center Controls - End Call */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-8 py-4 flex items-center gap-3 rounded-2xl font-semibold text-white transition-all duration-200 hover:scale-105 shadow-strong border-2 border-red-500/50"
                          onClick={() => {
                            // Stop recording if active
                            if (isRecording) {
                              stopRecording();
                            }
                            // Stop AI transcription if active
                            if (isTranscribing) {
                              stopAITranscription();
                            }
                            navigate("/");
                            window.location.reload();
                          }}
                        >
                          <LeaveIcon size={24} />
                          <span className="text-lg">Leave Meeting</span>
                        </button>
                        {(isRecording || isTranscribing) && (
                          <div className="text-xs text-red-400 flex items-center gap-1">
                            <RecordingIcon className="animate-pulse" />
                            <span>
                              {isRecording && isTranscribing 
                                ? "Recording & AI will stop" 
                                : isRecording 
                                ? "Recording will stop"
                                : "AI transcription will stop"
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right Controls */}
                      <div className="flex gap-3">
                        {/* Share */}
                        <button
                          className="glass border-neutral-700 hover:border-primary-500 border-2 p-3 cursor-pointer rounded-xl text-white text-xl transition-all duration-200 hover:scale-105"
                          onClick={() => setShare(true)}
                          title="Share meeting"
                        >
                          <ShareIcon />
                        </button>

                        {/* Chat */}
                        <button
                          className={`${
                            showChat
                              ? "bg-primary-600 border-primary-500 shadow-glow"
                              : "glass border-neutral-700"
                          } border-2 p-3 cursor-pointer rounded-xl text-white text-xl transition-all duration-200 hover:scale-105`}
                          onClick={() => {
                            setshowChat(!showChat);
                          }}
                          title={showChat ? "Hide chat" : "Show chat"}
                        >
                          <ChatIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
                {showChat && (
                  <motion.div
                    layout
                    className="flex flex-col w-96 flex-shrink-0 glass border-l border-neutral-800/50"
                  >
                    <div
                      className="flex-shrink-0 overflow-y-auto"
                      style={{
                        height: "calc(100vh - 88px)",
                      }}
                    >
                      {/* Participants Section */}
                      <div className="border-b border-neutral-800/50">
                        <div
                          className="flex items-center w-full p-4 cursor-pointer hover:bg-neutral-800/30 transition-colors duration-200"
                          onClick={() => setParticpentsOpen(!particpentsOpen)}
                        >
                          <div className="text-lg text-primary-400">
                            <UsersIcon />
                          </div>
                          <div className="ml-3 text-sm font-medium text-white">
                            Participants ({peers.length + 1})
                          </div>
                          <div
                            className={`${
                              particpentsOpen && "rotate-180"
                            } transition-transform duration-200 ml-auto text-lg text-neutral-400`}
                          >
                            <DownIcon />
                          </div>
                        </div>
                        <motion.div
                          layout
                          className={`${
                            particpentsOpen ? "block" : "hidden"
                          } max-h-48 overflow-y-auto`}
                        >
                          <div className="p-2 space-y-2">
                            <AnimatePresence>
                              {/* Current User */}
                              <motion.div
                                layout
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                exit={{ opacity: 0 }}
                                className="p-3 flex items-center gap-3 rounded-lg glass border border-neutral-800/50 hover:border-primary-500/30 transition-all duration-200"
                              >
                                <img
                                  src={
                                    user.photoURL ||
                                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                                  }
                                  alt={user.displayName || "You"}
                                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/30"
                                />
                                <div className="flex-1">
                                  <span className="font-medium text-white text-sm">
                                    {user.displayName || "You"}
                                  </span>
                                  <span className="text-primary-400 text-xs ml-2">(You)</span>
                                </div>
                                <div className="flex gap-1">
                                  <div className={`w-2 h-2 rounded-full ${micOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                  <div className={`w-2 h-2 rounded-full ${videoActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                </div>
                              </motion.div>

                              {/* Remote Users */}
                              {peers.map((peer) => (
                                <motion.div
                                  layout
                                  initial={{ x: 100, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ duration: 0.2 }}
                                  exit={{ opacity: 0 }}
                                  key={peer.peerID}
                                  className="p-3 flex items-center gap-3 rounded-lg glass border border-neutral-800/50 hover:border-primary-500/30 transition-all duration-200"
                                >
                                  <img
                                    src={
                                      peer.user.photoURL ||
                                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                                    }
                                    alt={peer.user.name || "Anonymous"}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                  <span className="font-medium text-white text-sm flex-1">
                                    {peer.user.name || "Anonymous"}
                                  </span>
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      </div>

                      {/* Chat & Transcription Tabs */}
                      <div className="flex flex-col h-full">
                        {/* Tab Headers */}
                        <div className="flex border-b border-neutral-800/50">
                          <button
                            className={`flex-1 flex items-center justify-center p-4 transition-colors duration-200 ${
                              !showTranscription
                                ? 'bg-primary-600/20 border-b-2 border-primary-500 text-white'
                                : 'hover:bg-neutral-800/30 text-neutral-400'
                            }`}
                            onClick={() => setShowTranscription(false)}
                          >
                            <ChatIcon className="mr-2" />
                            <span className="text-sm font-medium">Chat</span>
                            {msgs.length > 0 && (
                              <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                                {msgs.length}
                              </span>
                            )}
                          </button>
                          <button
                            className={`flex-1 flex items-center justify-center p-4 transition-colors duration-200 ${
                              showTranscription
                                ? 'bg-purple-600/20 border-b-2 border-purple-500 text-white'
                                : 'hover:bg-neutral-800/30 text-neutral-400'
                            }`}
                            onClick={() => setShowTranscription(true)}
                          >
                            <TranscribeIcon className="mr-2" />
                            <span className="text-sm font-medium">Transcript</span>
                            {isTranscribing && (
                              <SparklesIcon className="ml-2 text-purple-400 animate-pulse" />
                            )}
                          </button>
                        </div>

                        {/* Tab Content */}
                        {!showTranscription ? (
                          /* Chat Tab */
                          <>
                            {/* Messages */}
                            <motion.div
                              layout
                              ref={chatScroll}
                              className="flex-1 p-4 overflow-y-auto space-y-4"
                              style={{ height: "calc(100% - 120px)" }}
                            >
                              {msgs.length === 0 ? (
                                <div className="text-center text-neutral-400 py-8">
                                  <ChatIcon className="mx-auto text-3xl mb-2 opacity-50" />
                                  <p className="text-sm">No messages yet</p>
                                  <p className="text-xs">Start the conversation!</p>
                                </div>
                              ) : (
                                msgs.map((msg, index) => (
                                  <motion.div
                                    layout
                                    initial={{ 
                                      x: msg?.user.id === user?.uid ? 50 : -50, 
                                      opacity: 0,
                                      scale: 0.95
                                    }}
                                    animate={{ x: 0, opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className={`flex gap-3 ${
                                      msg?.user.id === user?.uid
                                        ? "flex-row-reverse"
                                        : ""
                                    }`}
                                    key={index}
                                  >
                                    <img
                                      src={msg?.user.profilePic || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"}
                                      alt={msg?.user.name}
                                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                    />
                                    <div className={`max-w-[75%] ${msg?.user.id === user?.uid ? 'text-right' : ''}`}>
                                      <div className={`${
                                        msg?.user.id === user?.uid
                                          ? "bg-primary-600 text-white"
                                          : "glass border border-neutral-800/50 text-neutral-100"
                                      } px-4 py-2 rounded-2xl text-sm leading-relaxed`}>
                                        {msg?.message}
                                      </div>
                                      <p className="text-xs text-neutral-500 mt-1">
                                        {msg?.user.name}
                                      </p>
                                    </div>
                                  </motion.div>
                                ))
                              )}
                            </motion.div>

                            {/* Chat Input */}
                            <div className="p-4 border-t border-neutral-800/50 glass">
                              <form onSubmit={sendMessage}>
                                <div className="flex items-center gap-3">
                                  <div className="relative flex-1">
                                    <input
                                      type="text"
                                      value={msgText}
                                      onChange={(e) => setMsgText(e.target.value)}
                                      className="w-full p-3 pr-12 text-sm bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                                      placeholder="Type a message..."
                                    />
                                    {msgText && (
                                      <button
                                        type="button"
                                        onClick={() => setMsgText("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors duration-200"
                                      >
                                        <ClearIcon />
                                      </button>
                                    )}
                                  </div>
                                  <button 
                                    type="submit"
                                    disabled={!msgText.trim()}
                                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-700 disabled:cursor-not-allowed p-3 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
                                  >
                                    <SendIcon />
                                  </button>
                                </div>
                              </form>
                            </div>
                          </>
                        ) : (
                          /* Transcription Tab */
                          <>
                            {/* Transcription Header */}
                            <div className="p-4 border-b border-neutral-800/50 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <TranscribeIcon className="text-purple-400" />
                                  <span className="text-sm font-medium text-white">Live Transcription</span>
                                  {isTranscribing && <span className="text-xs text-green-400">● LIVE</span>}
                                </div>
                                <div className="flex gap-2">
                                  {transcriptions.length > 0 && (
                                    <>
                                      <button
                                        onClick={downloadTranscription}
                                        className="p-2 hover:bg-neutral-700 rounded-lg transition-colors duration-200 text-neutral-400 hover:text-white"
                                        title="Download transcript as TXT"
                                      >
                                        <DownloadIcon className="text-sm" />
                                      </button>
                                      <button
                                        onClick={downloadTranscriptionAsPDF}
                                        className="p-2 hover:bg-neutral-700 rounded-lg transition-colors duration-200 text-neutral-400 hover:text-white"
                                        title="Download transcript as PDF"
                                      >
                                        <PDFIcon className="text-sm" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={clearTranscription}
                                    className="p-2 hover:bg-neutral-700 rounded-lg transition-colors duration-200 text-neutral-400 hover:text-white"
                                    title="Clear transcript"
                                  >
                                    <ClearIcon className="text-sm" />
                                  </button>
                                </div>
                              </div>
                              
                              {/* Language Selector */}
                              <div className="flex items-center gap-2">
                                <LanguageIcon className="text-neutral-400 text-sm" />
                                <select
                                  value={transcriptionLanguage}
                                  onChange={(e) => setTranscriptionLanguage(e.target.value)}
                                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  disabled={isTranscribing}
                                >
                                  {languageOptions.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                      {lang.flag} {lang.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Transcription Content */}
                            <motion.div
                              layout
                              ref={transcriptionScrollRef}
                              className="flex-1 p-4 overflow-y-auto space-y-3"
                              style={{ height: "calc(100% - 140px)" }}
                            >
                              {transcriptions.length === 0 ? (
                                <div className="text-center text-neutral-400 py-8">
                                  <TranscribeIcon className="mx-auto text-3xl mb-2 opacity-50" />
                                  <p className="text-sm">No transcription yet</p>
                                  <p className="text-xs">
                                    {isTranscribing 
                                      ? "Start speaking to see live transcription..." 
                                      : "Click the AI button to start transcription"
                                    }
                                  </p>
                                </div>
                              ) : (
                                transcriptions.map((transcript) => (
                                  <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    key={transcript.id}
                                    className={`p-3 rounded-lg ${
                                      transcript.isSystem
                                        ? 'bg-purple-600/20 border border-purple-500/30'
                                        : transcript.isInterim
                                        ? 'bg-neutral-800/50 border border-neutral-700/50 opacity-70'
                                        : 'glass border border-neutral-800/50'
                                    }`}
                                  >
                                    {!transcript.isSystem && (
                                      <div className="flex items-center gap-2 mb-2">
                                        {transcript.speaker.photoURL ? (
                                          <img
                                            src={transcript.speaker.photoURL}
                                            alt={transcript.speaker.name}
                                            className="w-5 h-5 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">
                                              {transcript.speaker.name?.charAt(0)}
                                            </span>
                                          </div>
                                        )}
                                        <span className="text-xs font-medium text-neutral-300">
                                          {transcript.speaker.name}
                                        </span>
                                        <span className="text-xs text-neutral-500">
                                          {transcript.timestamp.toLocaleTimeString()}
                                        </span>
                                        {transcript.confidence && (
                                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            transcript.confidence > 0.8
                                              ? 'bg-green-600/20 text-green-400'
                                              : transcript.confidence > 0.6
                                              ? 'bg-yellow-600/20 text-yellow-400'
                                              : 'bg-red-600/20 text-red-400'
                                          }`}>
                                            {Math.round(transcript.confidence * 100)}%
                                          </span>
                                        )}
                                        {transcript.isInterim && (
                                          <span className="text-xs text-purple-400 animate-pulse">
                                            typing...
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    <p className={`text-sm leading-relaxed ${
                                      transcript.isSystem ? 'text-purple-300 italic' : 'text-neutral-100'
                                    }`}>
                                      {transcript.text}
                                    </p>
                                  </motion.div>
                                ))
                              )}
                            </motion.div>

                            {/* AI Feature Controls */}
                            <div className="p-4 border-t border-neutral-800/50 glass">
                              <div className="space-y-3">
                                {!aiFeatureActive ? (
                                  <button
                                    onClick={startAITranscription}
                                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105 shadow-glow flex items-center justify-center gap-2"
                                  >
                                    <SparklesIcon />
                                    Start AI Transcription
                                  </button>
                                ) : (
                                  <div className="space-y-2">
                                    <button
                                      onClick={stopAITranscription}
                                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105 shadow-glow flex items-center justify-center gap-2"
                                    >
                                      <TranscribeIcon />
                                      Stop Transcription
                                    </button>
                                    {currentSpeaker && (
                                      <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                                        <MicActiveIcon className="animate-pulse text-purple-400" />
                                        <span>{currentSpeaker.name} is speaking</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          )}
          {share && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass border border-neutral-800/50 rounded-2xl p-6 w-full max-w-md mx-4 relative"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white">Share Meeting</h3>
                    <p className="text-sm text-neutral-400">
                      Invite others to join this meeting
                    </p>
                  </div>
                  <button
                    onClick={() => setShare(false)}
                    className="p-2 hover:bg-neutral-800 rounded-lg transition-colors duration-200 text-neutral-400 hover:text-white"
                  >
                    <ClearIcon size={20} />
                  </button>
                </div>

                {/* Meeting Link */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">Meeting Link</label>
                    <div className="flex items-center gap-2 p-3 bg-neutral-800 border border-neutral-700 rounded-lg">
                      <LinkIcon className="text-neutral-400" />
                      <div className="flex-1 text-sm text-white font-mono truncate">
                        {window.location.href}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          // You could add a toast notification here
                        }}
                        className="p-2 hover:bg-neutral-700 rounded-lg transition-colors duration-200 text-neutral-400 hover:text-white"
                        title="Copy link"
                      >
                        <CopyToClipboardIcon />
                      </button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">QR Code</label>
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <QRCode
                        size={160}
                        value={window.location.href}
                        logoImage="/images/logo.png"
                        qrStyle="dots"
                        eyeRadius={8}
                        logoWidth={32}
                        logoHeight={32}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setShare(false);
                      }}
                      className="flex-1 btn-primary px-4 py-2 text-white font-medium rounded-lg transition-all duration-200"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => setShare(false)}
                      className="px-4 py-2 btn-secondary text-neutral-300 font-medium rounded-lg transition-all duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Recording Complete Modal */}
          {recordedBlob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass border border-neutral-800/50 rounded-2xl p-6 w-full max-w-md mx-4 relative"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <RecordingIcon className="text-green-500" />
                      Recording Complete
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Your meeting recording is ready
                    </p>
                  </div>
                  <button
                    onClick={resetRecording}
                    className="p-2 hover:bg-neutral-800 rounded-lg transition-colors duration-200 text-neutral-400 hover:text-white"
                  >
                    <ClearIcon size={20} />
                  </button>
                </div>

                {/* Recording Info */}
                <div className="space-y-4">
                  <div className="p-4 bg-neutral-800/50 border border-neutral-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-white">Recording Duration</div>
                        <div className="text-lg font-mono text-primary-400">
                          {formatTime(recordingTime)}
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center">
                        <DownloadIcon className="text-green-500 text-xl" />
                      </div>
                    </div>
                  </div>

                  {/* Recording Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Format:</span>
                      <span className="text-white">WebM Video</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Quality:</span>
                      <span className="text-white">HD (1080p)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Audio:</span>
                      <span className="text-white">All Participants</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={downloadRecording}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-4 py-3 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-glow flex items-center justify-center gap-2"
                    >
                      <DownloadIcon />
                      Download
                    </button>
                    <button
                      onClick={() => {
                        resetRecording();
                        startRecording();
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-3 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-glow flex items-center justify-center gap-2"
                    >
                      <RecordIcon />
                      Record Again
                    </button>
                  </div>
                  
                  <button
                    onClick={resetRecording}
                    className="w-full px-4 py-2 text-neutral-400 hover:text-white font-medium rounded-lg transition-all duration-200"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-glow">
                <span className="text-white font-bold text-2xl">N</span>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">Welcome to Nexus Meet</h1>
                <p className="text-neutral-400">Please sign in to join the meeting</p>
              </div>
            </div>
            
            <button
              className="btn-primary px-6 py-3 text-white font-medium rounded-lg flex items-center gap-3 mx-auto shadow-glow transition-all duration-200 hover:scale-105"
              onClick={login}
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <GoogleIcon size={20} />
              </div>
              Continue with Google
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Room;
