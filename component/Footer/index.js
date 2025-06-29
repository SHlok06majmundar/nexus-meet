import { Video } from "lucide-react";
import Link from "next/link";
import React from "react";
import { FaGithub, FaLinkedin, FaInstagram, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-white/5 backdrop-blur-sm py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Logo and App Description */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <Video size={16} className="text-white" />
              </div>
              <span className="text-lg font-semibold text-white">Nexus Meet</span>
            </div>
            <p className="text-sm text-blue-200 mb-4">
              A seamless video conferencing platform built for teams and individuals
              who need reliable, secure communication.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-white font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-blue-200 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-blue-200 hover:text-white transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="text-blue-200 hover:text-white transition">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="text-blue-200 hover:text-white transition">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="col-span-1">
            <h3 className="text-white font-medium mb-4">Features</h3>
            <ul className="space-y-2">
              <li className="text-blue-200">HD Video Conferencing</li>
              <li className="text-blue-200">Real-time Chat</li>
              
              <li className="text-blue-200">Participant Controls</li>
              <li className="text-blue-200">Low Latency</li>
            </ul>
          </div>

          {/* Connect */}
          <div className="col-span-1">
            <h3 className="text-white font-medium mb-4">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <Link 
                href="https://www.linkedin.com/in/shlok-majmundar-988851252/" 
                target="_blank"
                className="text-blue-200 hover:text-white transition"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={22} />
              </Link>
              <Link 
                href="https://www.instagram.com/shlok.majmundar" 
                target="_blank"
                className="text-blue-200 hover:text-white transition"
                aria-label="Instagram"
              >
                <FaInstagram size={22} />
              </Link>
              <Link 
                href="https://github.com/SHlok06majmundar" 
                target="_blank"
                className="text-blue-200 hover:text-white transition"
                aria-label="GitHub"
              >
                <FaGithub size={22} />
              </Link>
              <Link 
                href="mailto:majmundarshlok06@gmail.com" 
                className="text-blue-200 hover:text-white transition"
                aria-label="Email"
              >
                <FaEnvelope size={22} />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex justify-center items-center">
          <p className="text-sm text-blue-200">
            © {new Date().getFullYear()} Nexus Meet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
