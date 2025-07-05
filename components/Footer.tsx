'use client';
import { Github, Linkedin, Instagram } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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
    <footer className="relative overflow-hidden border-t border-white/10 bg-gradient-to-br from-dark-1 via-dark-2 to-black">
      {' '}
      {/* Background Pattern */}{' '}
      <div className="absolute inset-0 opacity-5">
        {' '}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.15)_1px,_transparent_0)] bg-[length:20px_20px]"></div>{' '}
      </div>{' '}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {' '}
        {/* Main Footer Content */}{' '}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {' '}
          {/* Brand Section */}{' '}
          <div className="lg:col-span-1">
            {' '}
            <div className="mb-6 flex items-center gap-2">
              {' '}
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                {' '}
                <Image
                  src="/icons/logo.jpeg"
                  width={32}
                  height={32}
                  alt="nexus meet logo"
                  className="rounded-lg"
                />{' '}
              </div>{' '}
              <h3 className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-xl font-bold text-transparent">
                {' '}
                Nexus Meet{' '}
              </h3>{' '}
            </div>{' '}
            <p className="mb-6 text-sm leading-relaxed text-white/70">
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
                  className={`rounded-lg border border-white/10 bg-white/5 p-2 transition-all duration-300 hover:scale-110 hover:border-white/20 hover:bg-white/10 ${social.color}`}
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
            <h4 className="mb-6 text-lg font-semibold text-white">
              Quick Links
            </h4>{' '}
            <ul className="space-y-3">
              {' '}
              {quickLinks.map((link) => (
                <li key={link.name}>
                  {' '}
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-white/70 transition-colors duration-200 hover:text-white"
                  >
                    {' '}
                    <div className="size-1 rounded-full bg-blue-400 transition-all duration-200 group-hover:w-2"></div>{' '}
                    {link.name}{' '}
                  </Link>{' '}
                </li>
              ))}{' '}
            </ul>{' '}
          </div>{' '}
          {/* Features */}{' '}
          <div className="lg:col-span-1">
            {' '}
            <h4 className="mb-6 text-lg font-semibold text-white">
              Features
            </h4>{' '}
            <ul className="space-y-3">
              {' '}
              {features.map((feature) => (
                <li
                  key={feature}
                  className="group flex items-center gap-2 text-sm text-white/70"
                >
                  {' '}
                  <div className="size-1 rounded-full bg-purple-400 transition-all duration-200 group-hover:w-2"></div>{' '}
                  {feature}{' '}
                </li>
              ))}{' '}
            </ul>{' '}
          </div>{' '}
          {/* Contact & Developer Info */}{' '}
          <div className="lg:col-span-1">
            {' '}
            <h4 className="mb-6 text-lg font-semibold text-white">
              Developer
            </h4>{' '}
            <div className="space-y-4">
              {' '}
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4">
                {' '}
                <div className="mb-2 flex items-center gap-3">
                  {' '}
                  <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    {' '}
                    <span className="text-sm font-semibold text-white">
                      SM
                    </span>{' '}
                  </div>{' '}
                  <div>
                    {' '}
                    <h5 className="text-sm font-semibold text-white">
                      Shlok Majmundar
                    </h5>{' '}
                    <p className="text-xs text-white/60">
                      Full Stack Developer
                    </p>{' '}
                  </div>{' '}
                </div>{' '}
                <p className="text-xs leading-relaxed text-white/70">
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
                  className="group flex items-center gap-2 text-xs text-white/60 transition-colors duration-200 hover:text-blue-400"
                >
                  {' '}
                  <Linkedin
                    size={12}
                    className="transition-transform duration-200 group-hover:scale-110"
                  />{' '}
                  <span>Connect via LinkedIn</span>{' '}
                </Link>{' '}
                <Link
                  href="https://github.com/SHlok06majmundar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-xs text-white/60 transition-colors duration-200 hover:text-gray-300"
                >
                  {' '}
                  <Github
                    size={12}
                    className="transition-transform duration-200 group-hover:scale-110"
                  />{' '}
                  <span>View Projects on GitHub</span>{' '}
                </Link>{' '}
                <Link
                  href="https://www.instagram.com/shlok.majmundar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-xs text-white/60 transition-colors duration-200 hover:text-pink-400"
                >
                  {' '}
                  <Instagram
                    size={12}
                    className="transition-transform duration-200 group-hover:scale-110"
                  />{' '}
                  <span>Follow on Instagram</span>{' '}
                </Link>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        {/* Divider */}{' '}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent lg:my-12"></div>{' '}
        {/* Bottom Section */}{' '}
        <div className="flex flex-col items-center justify-center gap-4 lg:flex-row">
          {' '}
          <div className="flex flex-col items-center gap-4 text-sm text-white/60 sm:flex-row">
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
