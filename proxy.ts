// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // 1. Initialize the response
  const response = NextResponse.next();

  // 2. Add Security Headers
  
  // Anti-Clickjacking: Prevents your site from being embedded in an iframe on malicious sites.
  response.headers.set('X-Frame-Options', 'DENY'); 
  
  // Anti-MIME Sniffing: Stops the browser from guessing the file type (security best practice).
  response.headers.set('X-Content-Type-Options', 'nosniff'); 
  
  // Referrer Policy: Only send the origin (domain) when navigating to other sites, not the full URL.
  // This protects privacy so other sites don't know the exact page user came from.
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Optional: Strict Transport Security (HSTS)
  // Forces the browser to use HTTPS. (Vercel does this automatically, but good to have explicit)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  return response;
}

// 3. Configuration: Apply to all routes
export const config = {
  matcher: '/:path*',
};