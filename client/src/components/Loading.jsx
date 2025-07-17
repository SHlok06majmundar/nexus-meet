import React from "react";

const Loading = () => {
  return (
    <div className="flex h-screen justify-center items-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="flex flex-col items-center space-y-6">
        {/* Logo with Pulse Animation */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-glow animate-pulse">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          {/* Rotating Ring */}
          <div className="absolute inset-0 border-4 border-primary-400/30 border-t-primary-400 rounded-2xl animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-white">
            Joining Meeting...
          </h3>
          <p className="text-neutral-400 text-sm">
            Setting up your camera and microphone
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
