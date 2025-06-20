import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Head from "next/head";

export default function SignUpPage() {
  return (
    <>
      <Head>
        <title>Sign Up | Nexus Meet</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mb-8 text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Nexus Meet
          </h1>
          <p className="text-lightText opacity-80">
            Create your account to start your virtual meetings
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md glass-effect rounded-xl p-2 sm:p-4"
        >
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: "bg-buttonPrimary hover:bg-indigo-600",
                formFieldInput: "bg-secondary border-gray-600 text-lightText",
                card: "bg-transparent shadow-none",
                headerTitle: "text-lightText",
                headerSubtitle: "text-lightText opacity-80",
                socialButtonsBlockButton: "border-gray-600 text-lightText",
                dividerText: "text-lightText opacity-60",
                formFieldLabel: "text-lightText",
                footer: "text-lightText opacity-80",
              }
            }}
          />
        </motion.div>
      </div>
    </>
  );
}
