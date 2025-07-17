import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { AiOutlineLogout as LogOutIcon } from "react-icons/ai";

const Header = () => {
  const { user, login, logout } = useAuth();
  return (
    <header className="h-16 px-6 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800/50 text-neutral-100 w-full flex items-center shadow-medium">
      <div className="flex-grow">
        <Link 
          to="/" 
          className="flex items-center gap-3 font-bold text-xl tracking-tight hover:text-primary-400 transition-colors duration-200"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          Nexus Meet
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="relative group">
            <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-neutral-700 hover:ring-primary-500 transition-all duration-200 cursor-pointer">
              <img
                className="h-full w-full object-cover"
                src={user?.photoURL}
                alt={user?.displayName}
              />
            </div>
            <button
              className="absolute inset-0 flex opacity-0 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 items-center justify-center bg-black/80 rounded-full backdrop-blur-sm"
              onClick={logout}
              title="Sign out"
            >
              <LogOutIcon className="text-white text-lg" />
            </button>
          </div>
        ) : (
          <button
            className="btn-primary px-6 py-2 text-white font-medium text-sm rounded-lg flex items-center gap-2 shadow-medium hover:shadow-glow transition-all duration-200"
            onClick={login}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
