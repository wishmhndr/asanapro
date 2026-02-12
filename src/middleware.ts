import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-me')

export async function middleware(request: NextRequest) {
    // Only protect /app routes
    if (request.nextUrl.pathname.startsWith('/app')) {
        let session = request.cookies.get('session')?.value

        // Fallback to backup session for PWA
        if (!session) {
            session = request.cookies.get('session_backup')?.value

            // If backup exists, restore main session
            if (session) {
                const response = NextResponse.next()
                response.cookies.set('session', session, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 365,
                    path: '/',
                    sameSite: 'lax',
                })

                try {
                    await jwtVerify(session, SECRET_KEY)
                    return response
                } catch (e) {
                    return NextResponse.redirect(new URL('/login', request.url))
                }
            }

            return NextResponse.redirect(new URL('/login', request.url))
        }

        try {
            await jwtVerify(session, SECRET_KEY)
            // Token is valid
            return NextResponse.next()
        } catch (e) {
            // Token invalid
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Optional: Redirect logged in users away from login/register?
    // Optional: Redirect logged in users away from login/register?
    // if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') {
    //     const session = request.cookies.get('session')?.value
    //     if (session) {
    //         try {
    //             await jwtVerify(session, SECRET_KEY)
    //             return NextResponse.redirect(new URL('/app/dashboard', request.url))
    //         } catch (e) {
    //             // invalid token, let them login
    //         }
    //     }
    // }

    return NextResponse.next()
}

export const config = {
    matcher: ['/app/:path*', '/login', '/register'],
}
