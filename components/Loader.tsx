const Loader = () => {
  return (
    <div className="flex-center h-screen w-full bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="flex flex-col items-center gap-8">
        {/* Professional Loading Animation */}
        <div className="relative">
          {/* Main spinning circle */}
          <div className="size-16 animate-spin rounded-full border-4 border-white/10 border-t-blue-400"></div>
          {/* Secondary spinning circle - reverse animation */}
          <div className="absolute inset-0 size-16 animate-spin rounded-full border-4 border-transparent border-r-purple-400 [animation-direction:reverse] [animation-duration:1.5s]"></div>
          {/* Inner pulsing dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-2 animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-lg font-medium text-white/90">Loading</span>
            <div className="flex gap-1">
              <div className="size-1 animate-bounce rounded-full bg-blue-400 [animation-delay:0ms]"></div>
              <div className="size-1 animate-bounce rounded-full bg-purple-400 [animation-delay:150ms]"></div>
              <div className="size-1 animate-bounce rounded-full bg-pink-400 [animation-delay:300ms]"></div>
            </div>
          </div>
          <p className="text-sm text-white/60">
            Please wait while we prepare your experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loader;
