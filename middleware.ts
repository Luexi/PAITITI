import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Get the pathname
    const path = request.nextUrl.pathname;

    // If accessing admin routes (except login)
    if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
        // Get the session cookie
        const sessionCookie = request.cookies.get('sb-etfbgipaorilamlvgylu-auth-token');

        // If no session, redirect to login
        if (!sessionCookie) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
