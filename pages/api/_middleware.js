// Middleware for API routes to handle Socket.IO connections properly
import { NextResponse } from 'next/server';

export function middleware(req) {
  // Get the pathname of the request
  const { pathname } = req.nextUrl;
  
  // Add CORS headers for API routes
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next();
    
    // Add the CORS headers
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    return response;
  }
  
  return NextResponse.next();
}

// Only run middleware on API routes
export const config = {
  matcher: '/api/:path*',
};
