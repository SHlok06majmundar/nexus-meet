const Loader = () => {
  return (
    <div className="flex-center h-screen w-full bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="size-20 animate-spin rounded-full border-4 border-blue-200/30 border-t-blue-400"></div>
          <div className="absolute inset-0 size-20 animate-ping rounded-full border-4 border-purple-200/30"></div>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Loading...
          </h3>
          <p className="text-white/70 mt-2">Please wait while we set things up</p>
        </div>
      </div>
    </div>
  );
};

export default Loader;
