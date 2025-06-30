// This file is kept for reference but is no longer needed.
// Socket.io handling is now done directly in the socket-server.js API route.
// We'll use a direct socket server approach instead of middleware rewriting.

/*
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Special handling for socket.io requests
  const { pathname } = request.nextUrl;
  
  // For socket.io requests, passthrough to the appropriate handler
  if (pathname.startsWith('/socket.io/')) {
    return NextResponse.rewrite(new URL('/api/socket-server', request.url));
  }
  
  // Continue with default behavior for all other routes
  return NextResponse.next();
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: [
    '/socket.io/:path*', // Match all socket.io paths
  ],
};
*/
