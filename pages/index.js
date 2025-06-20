import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserButton, useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import Head from 'next/head';

// Icons
import { Video, LogIn, Plus, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const createAndJoin = () => {
    setIsLoading(true);
    const newRoomId = uuidv4();
    toast.success('Creating your meeting room...', { duration: 2000 });
    setTimeout(() => {
      router.push(`/${newRoomId}`);
    }, 500);
  }

  const joinRoom = () => {
    if (roomId) {
      setIsLoading(true);
      toast.success('Joining meeting room...', { duration: 2000 });
      setTimeout(() => {
        router.push(`/${roomId}`);
      }, 500);
    } else {
      toast.error('Please enter a valid room ID');
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl text-lightText">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Nexus Meet - Modern Video Conferencing</title>
        <meta name="description" content="Crystal clear video meetings. Join or start a meeting with a single click." />
      </Head>

      <div className="min-h-screen flex flex-col">
        <header className="glass-effect z-10 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
            >
              Nexus Meet
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {isSignedIn ? (
                <div className="flex items-center gap-4">
                  <span className="hidden md:inline-block text-lightText">
                    Hello, {user.firstName}
                  </span>
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <button 
                  onClick={() => router.push('/sign-in')}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <LogIn size={18} />
                  <span>Sign In</span>
                </button>
              )}
            </motion.div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-lightText mb-4">
              Virtual Meetings Made <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Beautiful</span>
            </h2>
            <p className="text-lightText opacity-80 max-w-2xl mx-auto text-lg">
              Crystal clear video, seamless audio, and modern design. Join a meeting or create one with a single click.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-md glass-effect rounded-xl p-6"
          >
            <div className="mb-6">
              <label className="block text-lightText mb-2 text-sm">Join an existing meeting</label>
              <div className="flex gap-2">
                <input 
                  className="input-field flex-1"
                  placeholder="Enter room ID" 
                  value={roomId} 
                  onChange={(e) => setRoomId(e.target.value)}
                />
                <button 
                  onClick={joinRoom} 
                  disabled={isLoading}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <ArrowRight size={18} />
                  <span className="hidden sm:inline">Join</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 my-4">
              <div className="h-px bg-white bg-opacity-20 flex-grow"></div>
              <span className="text-lightText opacity-60 text-sm">OR</span>
              <div className="h-px bg-white bg-opacity-20 flex-grow"></div>
            </div>

            <button 
              onClick={createAndJoin} 
              disabled={isLoading}
              className="btn btn-success w-full flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span>Create a new meeting</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl"
          >
            <div className="glass-effect rounded-lg p-5 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500 bg-opacity-20 text-indigo-300 mb-3">
                <Video size={24} />
              </div>
              <h3 className="font-medium text-lightText text-lg mb-2">HD Video</h3>
              <p className="text-lightText opacity-70 text-sm">
                Crystal clear video quality that brings people closer
              </p>
            </div>
            
            <div className="glass-effect rounded-lg p-5 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500 bg-opacity-20 text-purple-300 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
              </div>
              <h3 className="font-medium text-lightText text-lg mb-2">No Latency</h3>
              <p className="text-lightText opacity-70 text-sm">
                Feels like you're in the same room with everyone
              </p>
            </div>
            
            <div className="glass-effect rounded-lg p-5 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-500 bg-opacity-20 text-pink-300 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="15" y2="9"/></svg>
              </div>
              <h3 className="font-medium text-lightText text-lg mb-2">One Click</h3>
              <p className="text-lightText opacity-70 text-sm">
                Start or join a meeting instantly with no hassle
              </p>
            </div>
          </motion.div>
        </main>
        
        <footer className="py-6 text-center text-lightText opacity-60 text-sm">
          <p>© {new Date().getFullYear()} Nexus Meet. All rights reserved.</p>
        </footer>
      </div>
    </>
  )
}
