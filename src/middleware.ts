import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// 쿠키 이름 상수
const COOKIE_NAMES = {
  NEXT_AUTH_SESSION: 'authjs.session-token',
  NEXT_AUTH_SESSION_SECURE: '__Secure-authjs.session-token',
  USER_AUTH: 'user-auth',
} as const;

// Zustand 인증 쿠키 데이터 타입 정의
interface AuthCookieData {
  state: {
    user: {
      _id: string;
      type: string;
      token: {
        accessToken: string;
      };
    } | null;
  };
}

// 공통 쿠키 파싱 함수
function parseAuthCookie(request: NextRequest): AuthCookieData | null {
  const authCookie = request.cookies.get(COOKIE_NAMES.USER_AUTH);

  if (!authCookie?.value || authCookie.value === 'undefined' || authCookie.value === 'null' || authCookie.value.trim() === '') {
    return null;
  }

  try {
    return JSON.parse(authCookie.value) as AuthCookieData;
  } catch (error) {
    console.error('[Middleware] 쿠키 파싱 오류:', error);
    return null;
  }
}

// 쿠키에서 사용자 타입을 추출하는 함수
function getUserTypeFromCookie(request: NextRequest): string | null {
  const authData = parseAuthCookie(request);
  return authData?.state?.user?.type || null;
}

// 인증 상태 검증 함수 - NextAuth와 Zustand 모두 확인
function isAuthenticated(request: NextRequest): boolean {
  // 1. NextAuth 세션 쿠키 확인
  const nextAuthSessionToken = request.cookies.get(COOKIE_NAMES.NEXT_AUTH_SESSION) || request.cookies.get(COOKIE_NAMES.NEXT_AUTH_SESSION_SECURE);
  if (nextAuthSessionToken?.value) {
    return true; // NextAuth 세션이 있으면 인증된 것으로 간주
  }

  // 2. Zustand 쿠키 확인 (공통 파싱 함수 사용)
  const authData = parseAuthCookie(request);
  if (!authData) {
    return false;
  }

  // 실제로 user 객체가 존재하고 accessToken이 있는지 확인
  return !!(authData?.state?.user?._id && authData?.state?.user?.token?.accessToken);
}

// 권한 검증 함수
function hasPermission(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  const userType = getUserTypeFromCookie(request);

  // /admin 경로에 접근하려는 경우
  if (pathname.startsWith('/admin')) {
    return userType === 'admin'; // admin 타입만 허용
  }

  // 다른 경로들은 인증된 사용자면 접근 가능
  return true;
}

// 로그인 페이지로 리다이렉트하는 함수
function redirectToLogin(request: NextRequest): NextResponse {
  const callbackUrl = request.nextUrl.pathname + request.nextUrl.search;
  // reason=need-login
  return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}&reason=need-login`, request.url));
}

// 권한 없음 페이지로 리다이렉트하는 함수
function redirectToUnauthorized(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL('/unauthorized', request.url));
  response.cookies.set('from-middleware', 'true', { path: '/unauthorized', maxAge: 10 }); // 10초만 유지
  return response;
}

export async function middleware(request: NextRequest) {
  // 1. 인증 확인
  if (!isAuthenticated(request)) {
    return redirectToLogin(request);
  }

  // 2. 권한 확인
  if (!hasPermission(request)) {
    return redirectToUnauthorized(request);
  }

  // 인증되고 권한이 있는 경우 요청 계속 진행
  return NextResponse.next();
}

export const config = {
  matcher: ['/my-page/:path*', '/cart/:path*', '/admin/:path*'],
};
