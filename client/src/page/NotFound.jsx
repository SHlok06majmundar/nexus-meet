import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="text-center px-6 py-12">
        <div className="space-y-6">
          {/* 404 Number */}
          <div className="relative">
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              404
            </h1>
            <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-neutral-800/20 blur-sm">
              404
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-primary-400 uppercase tracking-wider">
              Page Not Found
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Oops! This page doesn't exist
            </h2>
            <p className="text-neutral-400 text-lg max-w-md mx-auto">
              The page you're looking for might have been moved, deleted, or doesn't exist.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link 
              to="/" 
              className="btn-primary px-6 py-3 text-white font-medium rounded-lg flex items-center gap-2 shadow-glow transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </Link>
            
            <button 
              onClick={() => window.history.back()} 
              className="btn-secondary px-6 py-3 text-neutral-300 font-medium rounded-lg flex items-center gap-2 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Go Back
            </button>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-primary-600/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary-400/5 rounded-full blur-2xl"></div>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
