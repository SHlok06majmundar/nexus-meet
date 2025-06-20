import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Video, Users, MessageSquare, Shield, Zap, ChevronRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    // Redirect to dashboard if already signed in
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  const joinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      setIsJoining(true);
      router.push(`/${roomId}`);
    }
  };

  // Features list for display
  const features = [
    { 
      icon: <Video size={24} className="text-blue-400" />, 
      title: "HD Video Conferencing", 
      description: "Crystal clear video for seamless communication" 
    },
    { 
      icon: <MessageSquare size={24} className="text-purple-400" />, 
      title: "Real-time Chat", 
      description: "Send messages during meetings with instant delivery" 
    },
    { 
      icon: <Users size={24} className="text-indigo-400" />, 
      title: "Team Collaboration", 
      description: "Connect with multiple participants in one meeting" 
    },
    { 
      icon: <Shield size={24} className="text-green-400" />, 
      title: "Secure Meetings", 
      description: "End-to-end encrypted for total privacy" 
    },
    { 
      icon: <Zap size={24} className="text-amber-400" />, 
      title: "Low Latency", 
      description: "Optimized performance for minimal delay" 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#20004A] via-[#30005A] to-[#50007A]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
            className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column: Hero text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                  <Video size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Nexus Meet</h2>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                <span className="block">Seamless Video Conferencing</span>
                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-400">
                  For Everyone
                </span>
              </h1>
              
              <p className="mt-6 text-lg text-blue-200 max-w-2xl">
                Connect with anyone, anywhere with our high-quality video conferencing platform. 
                Designed for teams and individuals who need reliable, secure communication.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <SignUpButton mode="modal">
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-900/30">
                    Get Started Free
                    <ChevronRight size={18} />
                  </button>
                </SignUpButton>
                
                <SignInButton mode="modal">
                  <button className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-all">
                    Sign In
                  </button>
                </SignInButton>
              </div>
              
              <div className="mt-8 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-8 w-8 rounded-full border-2 border-purple-900 bg-gradient-to-br from-purple-${(i+4)*100} to-pink-${(i+4)*100}`}></div>
                  ))}
                </div>
                <p className="text-sm text-blue-200">Join thousands of users worldwide</p>
              </div>
            </motion.div>
            
            {/* Right column: Meeting join card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-12 lg:mt-0"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8">
                <h3 className="text-xl font-semibold text-white mb-2">Join a Meeting</h3>
                <p className="text-blue-200 mb-6">Enter a meeting code to join an existing meeting instantly</p>
                
                <form onSubmit={joinRoom}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="roomId" className="block text-sm font-medium text-blue-200 mb-1">
                        Meeting Code
                      </label>
                      <input
                        type="text"
                        id="roomId"
                        placeholder="Enter meeting code"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={!roomId.trim() || isJoining}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-900 disabled:bg-blue-800 disabled:cursor-not-allowed"
                    >
                      {isJoining ? "Joining..." : "Join Meeting"}
                    </button>
                  </div>
                </form>
                
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-center text-blue-200 text-sm">
                    Don't have a meeting code? <SignInButton><span className="text-blue-400 cursor-pointer hover:underline">Sign in</span></SignInButton> to create one
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-blue-200 max-w-2xl mx-auto">
            Everything you need for seamless communication and collaboration in one platform
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition"
            >
              <div className="h-12 w-12 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-blue-200">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <Video size={16} className="text-white" />
              </div>
              <span className="text-lg font-semibold text-white">Nexus Meet</span>
            </div>
            
            <p className="text-sm text-blue-200">© {new Date().getFullYear()} Nexus Meet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
