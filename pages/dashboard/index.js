import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Video, Users, Calendar, Clock, Plus, ArrowRight } from "lucide-react";

const Dashboard = () => {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [meetingId, setMeetingId] = useState("");
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);
  
  const createNewMeeting = () => {
    setIsCreatingMeeting(true);
    // Generate a random meeting ID
    const randomId = Math.random().toString(36).substring(2, 11);
    router.push(`/${randomId}`);
  };
  
  const joinMeeting = (e) => {
    e.preventDefault();
    if (meetingId.trim()) {
      router.push(`/${meetingId}`);
    }
  };
  // Empty recent meetings array - no fake data
  const recentMeetings = [];

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
      <div className="animate-pulse text-white text-xl">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#20004A] via-[#30005A] to-[#50007A]">
      {/* Header */}
      <header className="px-4 py-4 md:px-8 flex items-center justify-between bg-[rgba(25,0,60,0.5)] backdrop-blur-lg border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-9 w-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center"
          >
            <Video size={18} className="text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold text-white"
          >
            Nexus Meet
          </motion.h1>
        </div>
        
        <div className="flex items-center gap-4">
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: "h-9 w-9"
              }
            }}
          />
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-purple-300">
            Welcome back, {user.firstName || user.username || "User"}
          </h2>
          <p className="mt-2 text-purple-200">
            Start or join a meeting with your team
          </p>
        </motion.div>
        
        {/* Actions cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[rgba(25,0,60,0.5)] backdrop-blur-md rounded-2xl p-6 border border-purple-500/20 hover:bg-[rgba(35,0,80,0.6)] transition-all duration-300 shadow-lg"
            style={{ boxShadow: "0 0 20px rgba(200, 90, 255, 0.2)" }}
          >
            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
              <Video size={24} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">New Meeting</h3>
            <p className="text-purple-200 mb-4">Create a new meeting and invite others</p>
            <button 
              onClick={createNewMeeting} 
              disabled={isCreatingMeeting}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {isCreatingMeeting ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                <>
                  <Plus size={18} />
                  Create New Meeting
                </>
              )}
            </button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[rgba(25,0,60,0.5)] backdrop-blur-md rounded-2xl p-6 border border-purple-500/20 hover:bg-[rgba(35,0,80,0.6)] transition-all duration-300 shadow-lg"
            style={{ boxShadow: "0 0 20px rgba(200, 90, 255, 0.2)" }}
          >
            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
              <Users size={24} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Join Meeting</h3>
            <p className="text-purple-200 mb-4">Join an existing meeting by ID</p>
            <form onSubmit={joinMeeting} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter meeting ID"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                className="px-4 py-2.5 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 flex-1 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              />
              <button 
                type="submit" 
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg flex items-center hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <ArrowRight size={18} />
              </button>
            </form>
          </motion.div>
        </div>
        
        {/* Recent meetings section (empty) */}
        {recentMeetings.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Recent Meetings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* No meetings to display */}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
