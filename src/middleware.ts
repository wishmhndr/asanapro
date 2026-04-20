import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-me')

async function getPayload(request: NextRequest) {
    const session = request.cookies.get('session')?.value
        || request.cookies.get('session_backup')?.value
    if (!session) return null
    try {
        const { payload } = await jwtVerify(session, SECRET_KEY)
        return payload
    } catch {
        return null
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (pathname.startsWith('/app')) {
        const payload = await getPayload(request)

        if (!payload) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Admin-only routes
        if (pathname.startsWith('/app/admin') && payload.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/app/dashboard', request.url))
        }

        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/app/:path*', '/login', '/register'],
}
