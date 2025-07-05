'use client';
import { Github, Linkedin, Instagram, Heart } from 'lucide-react';
import Link from 'next/link';
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const socialLinks = [
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/shlok-majmundar-988851252/',
      icon: Linkedin,
      color: 'hover:text-blue-400',
    },
    {
      name: 'GitHub',
      href: 'https://github.com/SHlok06majmundar',
      icon: Github,
      color: 'hover:text-gray-300',
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/shlok.majmundar',
      icon: Instagram,
      color: 'hover:text-pink-400',
    },
  ];
  const quickLinks = [
    { name: 'Dashboard', href: '/' },
    { name: 'Meetings', href: '/upcoming' },
    { name: 'Recordings', href: '/recordings' },
    { name: 'Personal Room', href: '/personal-room' },
  ];
  const features = [
    'HD Video Calling',
    'AI Transcription',
    'Real-time Chat',
    'Screen Sharing',
    'Meeting Recording',
    'Multi-platform Support',
  ];
  return (
    <footer className="bg-gradient-to-br from-dark-1 via-dark-2 to-black border-t border-white/10 relative overflow-hidden">
      {' '}
      {/* Background Pattern */}{' '}
      <div className="absolute inset-0 opacity-5">
        {' '}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.15)_1px,_transparent_0)] bg-[length:20px_20px]"></div>{' '}
      </div>{' '}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {' '}
        {/* Main Footer Content */}{' '}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {' '}
          {/* Brand Section */}{' '}
          <div className="lg:col-span-1">
            {' '}
            <div className="flex items-center gap-2 mb-6">
              {' '}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                {' '}
                <span className="text-white font-bold text-lg">N</span>{' '}
              </div>{' '}
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {' '}
                Nexus Meet{' '}
              </h3>{' '}
            </div>{' '}
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              {' '}
              Professional video conferencing platform with AI-powered
              transcription, real-time chat, and seamless collaboration tools.{' '}
            </p>{' '}
            {/* Social Links */}{' '}
            <div className="flex gap-4">
              {' '}
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-110 ${social.color}`}
                  title={social.name}
                >
                  {' '}
                  <social.icon size={18} />{' '}
                </Link>
              ))}{' '}
            </div>{' '}
          </div>{' '}
          {/* Quick Links */}{' '}
          <div className="lg:col-span-1">
            {' '}
            <h4 className="text-lg font-semibold text-white mb-6">
              Quick Links
            </h4>{' '}
            <ul className="space-y-3">
              {' '}
              {quickLinks.map((link) => (
                <li key={link.name}>
                  {' '}
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2 group"
                  >
                    {' '}
                    <div className="w-1 h-1 rounded-full bg-blue-400 group-hover:w-2 transition-all duration-200"></div>{' '}
                    {link.name}{' '}
                  </Link>{' '}
                </li>
              ))}{' '}
            </ul>{' '}
          </div>{' '}
          {/* Features */}{' '}
          <div className="lg:col-span-1">
            {' '}
            <h4 className="text-lg font-semibold text-white mb-6">
              Features
            </h4>{' '}
            <ul className="space-y-3">
              {' '}
              {features.map((feature) => (
                <li
                  key={feature}
                  className="text-white/70 text-sm flex items-center gap-2 group"
                >
                  {' '}
                  <div className="w-1 h-1 rounded-full bg-purple-400 group-hover:w-2 transition-all duration-200"></div>{' '}
                  {feature}{' '}
                </li>
              ))}{' '}
            </ul>{' '}
          </div>{' '}
          {/* Contact & Developer Info */}{' '}
          <div className="lg:col-span-1">
            {' '}
            <h4 className="text-lg font-semibold text-white mb-6">
              Developer
            </h4>{' '}
            <div className="space-y-4">
              {' '}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10">
                {' '}
                <div className="flex items-center gap-3 mb-2">
                  {' '}
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    {' '}
                    <span className="text-white font-semibold text-sm">
                      SM
                    </span>{' '}
                  </div>{' '}
                  <div>
                    {' '}
                    <h5 className="text-white font-semibold text-sm">
                      Shlok Majmundar
                    </h5>{' '}
                    <p className="text-white/60 text-xs">
                      Full Stack Developer
                    </p>{' '}
                  </div>{' '}
                </div>{' '}
                <p className="text-white/70 text-xs leading-relaxed">
                  {' '}
                  Passionate about creating innovative web solutions and modern
                  user experiences.{' '}
                </p>{' '}
              </div>{' '}
              <div className="space-y-2">
                {' '}
                <Link
                  href="https://www.linkedin.com/in/shlok-majmundar-988851252/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 hover:text-blue-400 transition-colors duration-200 text-xs group"
                >
                  {' '}
                  <Linkedin
                    size={12}
                    className="group-hover:scale-110 transition-transform duration-200"
                  />{' '}
                  <span>Connect via LinkedIn</span>{' '}
                </Link>{' '}
                <Link
                  href="https://github.com/SHlok06majmundar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 hover:text-gray-300 transition-colors duration-200 text-xs group"
                >
                  {' '}
                  <Github
                    size={12}
                    className="group-hover:scale-110 transition-transform duration-200"
                  />{' '}
                  <span>View Projects on GitHub</span>{' '}
                </Link>{' '}
                <Link
                  href="https://www.instagram.com/shlok.majmundar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 hover:text-pink-400 transition-colors duration-200 text-xs group"
                >
                  {' '}
                  <Instagram
                    size={12}
                    className="group-hover:scale-110 transition-transform duration-200"
                  />{' '}
                  <span>Follow on Instagram</span>{' '}
                </Link>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        {/* Divider */}{' '}
        <div className="my-8 lg:my-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>{' '}
        {/* Bottom Section */}{' '}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
          {' '}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-white/60 text-sm">
            {' '}
            <p className="flex items-center gap-1">
              {' '}
              © {currentYear} Nexus Meet. Made{' '}
               by Shlok Majmundar{' '}
            </p>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </footer>
  );
};
export default Footer;
