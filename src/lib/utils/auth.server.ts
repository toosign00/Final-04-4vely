'use server';

import { auth } from '@/auth';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL;

/**
 * 사용자 인증 정보를 NextAuth 세션 또는 쿠키에서 추출하는 유틸리티 함수
 * @description NextAuth 세션을 우선 확인하고, 없으면 user-auth 쿠키를 파싱하여 인증 정보 반환
 * @returns {Promise<{accessToken: string, userId: number} | null>} 인증 정보 객체 또는 null
 */
export async function getAuthInfo(): Promise<{ accessToken: string; userId: number } | null> {
  try {
    // 1. NextAuth 세션 확인
    const session = await auth();
    if (session?.user?.id && session?.user?.accessToken) {
      return {
        accessToken: session.user.accessToken,
        userId: parseInt(session.user.id),
      };
    }

    // 2. Zustand 쿠키 확인 (기존 로직)
    const cookieStore = await cookies();
    const userAuthCookie = cookieStore.get('user-auth')?.value;

    if (!userAuthCookie) return null;

    const userData = JSON.parse(userAuthCookie);
    const accessToken = userData.state?.user?.token?.accessToken;
    const userId = userData.state?.user?._id;

    return accessToken && userId ? { accessToken, userId } : null;
  } catch {
    // 세션/쿠키 파싱 실패 시 null 반환
    return null;
  }
}

/**
 * 이미지 경로를 전체 URL로 변환
 */
export async function getImageUrl(imagePath: string): Promise<string> {
  if (!imagePath) return '/images/placeholder-plant.svg';
  if (imagePath.startsWith('http')) return imagePath;

  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_URL}${normalizedPath}`;
}
