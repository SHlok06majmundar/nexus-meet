import React, { useEffect, useState } from "react";
import { useRef } from "react";

import { useNavigate, useParams } from "react-router-dom";

// icons
import { IoChatboxOutline as ChatIcon } from "react-icons/io5";
import { VscTriangleDown as DownIcon } from "react-icons/vsc";
import { FaUsers as UsersIcon } from "react-icons/fa";
import { FiSend as SendIcon } from "react-icons/fi";
import { FcGoogle as GoogleIcon } from "react-icons/fc";
import { MdCallEnd as CallEndIcon } from "react-icons/md";
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

  useEffect(() => {
    const unsub = () => {
      socket.current = io.connect(
        "http://localhost:5000/"
        // process.env.SOCKET_BACKEND_URL || "http://localhost:5000"
      );
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
            socket.current.on("all users", (users) => {
              const peers = [];
              users.forEach((user) => {
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
              setPeers(peers);
            });

            socket.current.on("user joined", (payload) => {
              // console.log(payload);
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
            });

            socket.current.on("receiving returned signal", (payload) => {
              const item = peersRef.current.find(
                (p) => p.peerID === payload.id
              );
              item.peer.signal(payload.signal);
            });

            socket.current.on("user left", (id) => {
              const audio = new Audio(leaveSFX);
              audio.play();
              const peerObj = peersRef.current.find((p) => p.peerID === id);
              if (peerObj) peerObj.peer.destroy();
              const peers = peersRef.current.filter((p) => p.peerID !== id);
              peersRef.current = peers;
              setPeers((users) => users.filter((p) => p.peerID !== id));
            });
          });
    };
    return unsub();
  }, [user, roomID]);

  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
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

    return peer;
  };

  const addPeer = (incomingSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });
    peer.on("signal", (signal) => {
      socket.current.emit("returning signal", { signal, callerID });
    });
    joinSound.play();
    peer.signal(incomingSignal);
    return peer;
  };

  return (
    <>
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
                  <div className="h-20 glass border-t border-neutral-800/50 p-4">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
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
                      </div>

                      {/* Center Controls - End Call */}
                      <div className="flex">
                        <button
                          className="bg-red-600 hover:bg-red-700 px-6 py-3 flex items-center gap-3 rounded-xl font-medium text-white transition-all duration-200 hover:scale-105 shadow-strong"
                          onClick={() => {
                            navigate("/");
                            window.location.reload();
                          }}
                        >
                          <CallEndIcon size={20} />
                          <span className="hidden sm:block">Leave</span>
                        </button>
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

                      {/* Chat Section */}
                      <div className="flex flex-col h-full">
                        <div className="flex items-center p-4 border-b border-neutral-800/50">
                          <div className="text-lg text-primary-400">
                            <ChatIcon />
                          </div>
                          <div className="ml-3 text-sm font-medium text-white">
                            Chat
                          </div>
                        </div>
                        
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
                      </div>
                    </div>

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
