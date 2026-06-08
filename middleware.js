import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('sail_token')?.value;
  const isAuthRoute = pathname.startsWith('/login');
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/complaints') || pathname.startsWith('/drawings') || pathname.startsWith('/maintenance') || pathname.startsWith('/work-orders') || pathname.startsWith('/users') || pathname.startsWith('/reports') || pathname.startsWith('/settings');

  if (isDashboardRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    if (!isAuthRoute) loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
