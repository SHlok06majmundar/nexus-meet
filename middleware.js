import { withClerkMiddleware, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Set the paths that don't require authentication
const publicPaths = ['/', '/sign-in*', '/sign-up*', '/api/socket*', '/api/*'];

const isPublic = (path) => {
  return publicPaths.find(publicPath => {
    const pathWithoutQuery = path.split('?')[0];
    return pathWithoutQuery.match(new RegExp(`^${publicPath}$`.replace('*', '.*')));
  });
};

// This function is the middleware
export default withClerkMiddleware((request) => {
  const { pathname } = request.nextUrl;
  
  // If the path is public or a static asset, allow the request
  if (isPublic(pathname) || pathname.includes('/_next') || pathname.includes('/public')) {
    return NextResponse.next();
  }
  
  // Get the authentication object
  const { userId } = getAuth(request);
  
  // If user is not signed in, redirect them to the sign-in page
  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
