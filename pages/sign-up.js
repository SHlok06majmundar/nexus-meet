import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

const SignUpPage = () => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-[#20004A] via-[#30005A] to-[#50007A]">
      <div className="absolute top-6 left-6">
        <Link href="/">
          <button className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-sm transition hover:bg-white/20">
            <ArrowLeftIcon size={18} />
            <span>Home</span>
          </button>
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-4 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
            className="absolute top-1/2 -right-20 h-64 w-64 rounded-full bg-pink-500/30 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 1 }}
            className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-purple-500/30 blur-3xl"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl font-bold text-white mb-2"
            >
              Create Your Account
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-pink-200"
            >
              Join Nexus Meet for seamless video conferencing
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="rounded-xl bg-white/10 p-2 backdrop-blur-md"
          >
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-sm normal-case",
                  footerActionLink: "text-pink-400 hover:text-pink-300",
                  card: "bg-transparent shadow-none",
                },
              }}
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPage;
