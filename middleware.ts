import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userRole = request.cookies.get('userRole')?.value

  // Public routes - no auth required
  const publicRoutes = ['/', '/login', '/register', '/tutors', '/tutor/login', '/tutor/register', '/admin/login', '/student-login', '/forgot-password', '/reset-password', '/verify']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

  if (isPublicRoute) {
    // If user is already logged in and hits a public route, redirect to their dashboard
    if (userRole) {
      const dashboards: Record<string, string> = {
        PARENT: '/parent',
        TUTOR: '/tutor',
        ADMIN: '/admin',
        STUDENT: '/student',
      }
      const dashboard = dashboards[userRole]
      if (dashboard) {
        return NextResponse.redirect(new URL(dashboard, request.url))
      }
    }
    return NextResponse.next()
  }

  // Protected routes - require auth
  if (!userRole) {
    // Redirect to appropriate login based on requested path
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    } else if (pathname.startsWith('/tutor')) {
      return NextResponse.redirect(new URL('/tutor/login', request.url))
    } else if (pathname.startsWith('/student')) {
      return NextResponse.redirect(new URL('/student-login', request.url))
    } else if (pathname.startsWith('/parent')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based access control
  const rolePrefixes: Record<string, string[]> = {
    PARENT: ['/parent'],
    TUTOR: ['/tutor'],
    ADMIN: ['/admin'],
    STUDENT: ['/student'],
  }

  const allowedPrefixes = rolePrefixes[userRole] || []
  const hasAccess = allowedPrefixes.some(prefix => pathname.startsWith(prefix))

  if (!hasAccess) {
    // User is logged in but accessing wrong area - redirect to their dashboard
    const dashboards: Record<string, string> = {
      PARENT: '/parent',
      TUTOR: '/tutor',
      ADMIN: '/admin',
      STUDENT: '/student',
    }
    const dashboard = dashboards[userRole]
    if (dashboard) {
      return NextResponse.redirect(new URL(dashboard, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|sounds).*)',
  ],
}
