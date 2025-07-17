import React, { useEffect, useState } from "react";
import HomeCard from "../components/HomeCard";

import { v4 as uuid } from "uuid";

// icons
import { MdVideoCall as NewCallIcon } from "react-icons/md";
import { Link } from "react-router-dom";

const Home = () => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ];
  const [date, setDate] = useState(new Date());
  const [roomId] = useState(uuid());
  
  function refreshClock() {
    setDate(new Date());
  }
  
  useEffect(() => {
    const timerId = setInterval(refreshClock, 1000);
    return function cleanup() {
      clearInterval(timerId);
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 min-h-screen text-neutral-100">
      <div className="container mx-auto px-6 py-8 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          {/* Left Section - Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Section */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                Welcome to Nexus Meet
              </h1>
              <p className="text-neutral-400 text-lg">
                Professional video conferencing for seamless collaboration
              </p>
            </div>

            {/* Action Cards Grid - Only Working Features */}
            <div className="max-w-md">
              <Link to={`/room/${roomId}`} className="block">
                <HomeCard
                  title="New Meeting"
                  desc="Start an instant meeting with HD video and audio"
                  icon={<NewCallIcon />}
                  bgColor="bg-yellow"
                />
              </Link>
            </div>

            {/* Features Section */}
            <div className="glass rounded-2xl p-6 border border-neutral-800/50">
              <h3 className="text-xl font-semibold text-white mb-4">Why choose Nexus Meet?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-white">Secure</h4>
                  <p className="text-sm text-neutral-400">End-to-end encryption for all your meetings</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-white">Fast</h4>
                  <p className="text-sm text-neutral-400">Lightning-fast connections and low latency</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-white">Simple</h4>
                  <p className="text-sm text-neutral-400">No downloads required, works in your browser</p>
                </div>
              </div>
            </div>

            {/* Footer Credit */}
            <div className="glass rounded-xl p-4 text-center border border-neutral-800/50">
              <p className="text-neutral-400 text-sm">
                Crafted with ❤️ by{" "}
                <a
                  href="https://github.com/SHlok06majmundar"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-400 hover:text-primary-300 font-medium transition-colors duration-200"
                >
                  Shlok Majmundar
                </a>
              </p>
            </div>
          </div>

          {/* Right Section - Clock & Info */}
          <div className="space-y-6">
            {/* Clock Widget */}
            <div className="glass rounded-2xl p-6 border border-neutral-800/50 bg-gradient-to-br from-neutral-800/20 to-neutral-900/20">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <div className="text-5xl font-light text-white tracking-wider">
                    {`${
                      date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
                    }:${
                      date.getMinutes() < 10
                        ? `0${date.getMinutes()}`
                        : date.getMinutes()
                    }`}
                  </div>
                  <div className="text-primary-400 font-medium">
                    {`${days[date.getDay()]}, ${date.getDate()} ${
                      months[date.getMonth()]
                    } ${date.getFullYear()}`}
                  </div>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent"></div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Quick Start</h3>
                  <div className="space-y-2 text-sm text-neutral-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span>Click "New Meeting" to start instantly</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span>Share the room link with participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span>Enjoy HD video calling experience</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
