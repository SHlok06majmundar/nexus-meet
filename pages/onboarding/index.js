import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const redirectToHome = () => {
    setLoading(true);
    router.push("/");
  };

  return (
    <>
      <Head>
        <title>Welcome to Nexus Meet</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl glass-effect rounded-xl p-8 text-center"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Welcome to Nexus Meet, {user?.firstName || "Friend"}!
            </h1>
            <p className="text-lightText opacity-80 text-lg">
              You're all set to start your virtual meetings with crystal clear video and audio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div 
              className="bg-secondary bg-opacity-60 p-6 rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-accent text-2xl mb-3">🎯 HD Video</div>
              <p className="text-lightText opacity-80">
                Experience high definition video with minimal latency for seamless conversations.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-secondary bg-opacity-60 p-6 rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-accent text-2xl mb-3">💬 Live Chat</div>
              <p className="text-lightText opacity-80">
                Share text messages, links, and more without interrupting the conversation.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-secondary bg-opacity-60 p-6 rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-accent text-2xl mb-3">🔒 Secure</div>
              <p className="text-lightText opacity-80">
                All communications are end-to-end encrypted for your privacy and security.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-secondary bg-opacity-60 p-6 rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-accent text-2xl mb-3">🚀 One Click</div>
              <p className="text-lightText opacity-80">
                Create a meeting room instantly and share with participants right away.
              </p>
            </motion.div>
          </div>

          <button 
            onClick={redirectToHome}
            disabled={loading}
            className="btn btn-primary px-8 py-3 text-lg"
          >
            {loading ? "Redirecting..." : "Go to Dashboard"}
          </button>
        </motion.div>
      </div>
    </>
  );
}
