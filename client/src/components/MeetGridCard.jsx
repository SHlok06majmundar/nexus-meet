import { motion } from "framer-motion";
import React, { useEffect } from "react";
import { useState } from "react";

// icons
import { IoMic as MicOnIcon } from "react-icons/io5";
import { IoMicOff as MicOffIcon } from "react-icons/io5";
import { BsPin as PinIcon } from "react-icons/bs";
import { BsPinFill as PinActiveIcon } from "react-icons/bs";
import { useRef } from "react";

const MeetGridCard = ({ user, micActive, peer }) => {
  const [pin, setPin] = useState(false);
  const videoRef = useRef();
  const [videoActive, setVideoActive] = useState(true);
  
  useEffect(() => {
    peer.on("stream", (stream) => {
      setVideoActive(
        stream.getTracks().find((track) => track.kind === "video").enabled
      );
      videoRef.current.srcObject = stream;
    });
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`relative glass rounded-2xl aspect-video overflow-hidden border border-neutral-800/50 group ${
        pin && "md:col-span-2 md:row-span-2 md:col-start-1 md:row-start-1"
      }`}
    >
      {/* Pin Button */}
      <div className="absolute top-4 right-4 z-30">
        <button
          className={`${
            pin
              ? "bg-primary-600 border-primary-500 shadow-glow"
              : "glass border-neutral-700"
          } border-2 p-2.5 cursor-pointer rounded-xl text-white text-lg transition-all duration-200 hover:scale-110`}
          onClick={() => {
            setPin(!pin);
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
          title={pin ? "Unpin video" : "Pin video"}
        >
          {pin ? <PinActiveIcon /> : <PinIcon />}
        </button>
      </div>

      {/* Video Element */}
      <video
        ref={videoRef}
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
              src={
                user?.photoURL ||
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face"
              }
              alt={user?.name || "Anonymous"}
            />
            <p className="text-neutral-300 font-medium">{user?.name || "Anonymous"}</p>
          </div>
        </div>
      )}

      {/* Microphone Status Indicator */}
      <div className="absolute top-4 left-4">
        <div className={`${
          micActive !== false 
            ? "bg-green-600 border-green-500" 
            : "bg-red-600 border-red-500"
        } border-2 p-2 rounded-lg transition-all duration-200`}>
          {micActive !== false ? (
            <MicOnIcon className="text-white text-sm" />
          ) : (
            <MicOffIcon className="text-white text-sm" />
          )}
        </div>
      </div>

      {/* User Name Badge */}
      <div className="absolute bottom-4 left-4">
        <div className="glass px-3 py-1.5 rounded-lg text-white text-sm font-medium border border-neutral-700/50">
          {user?.name || "Anonymous"}
        </div>
      </div>
      
      {/* Connection Status */}
      <div className="absolute bottom-4 right-4">
        <div className="w-3 h-3 bg-green-500 rounded-full shadow-glow animate-pulse"></div>
      </div>
    </motion.div>
  );
};

export default MeetGridCard;
