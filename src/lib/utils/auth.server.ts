'use server';

import { cookies } from 'next/headers';

/**
 * 사용자 인증 정보를 쿠키에서 추출하는 유틸리티 함수
 * @description Next.js cookies에서 user-auth 쿠키를 파싱하여 액세스 토큰과 사용자 ID 반환
 * @returns {Promise<{accessToken: string, userId: number} | null>} 인증 정보 객체 또는 null
 * @throws 쿠키 파싱 실패 시 null 반환
 */
export async function getAuthInfo(): Promise<{ accessToken: string; userId: number } | null> {
  try {
    const cookieStore = await cookies();
    const userAuthCookie = cookieStore.get('user-auth')?.value;

    if (!userAuthCookie) return null;

    const userData = JSON.parse(userAuthCookie);
    const accessToken = userData.state?.user?.token?.accessToken;
    const userId = userData.state?.user?._id;

    return accessToken && userId ? { accessToken, userId } : null;
  } catch {
    // 쿠키 파싱 실패 시 null 반환
    return null;
  }
}
