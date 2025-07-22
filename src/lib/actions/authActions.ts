'use server';

import { loginUser, logoutUser, refreshAccessToken } from '@/lib/functions/authFunctions';
import { ApiRes } from '@/types/api.types';
import type { LoginCredentials, LoginResult } from '@/types/user.types';
import { cookies } from 'next/headers';

/**
 * 로그인 서버 액션
 * 폼 제출을 처리하고 사용자 인터랙션에 응답
 * @param credentials - 로그인 자격 증명
 * @returns 표준화된 API 응답 형태
 */
export async function loginAction(credentials: LoginCredentials): Promise<LoginResult> {
  try {
    // 서버 함수 호출
    const result = await loginUser(credentials);

    // 로그인 성공 시 서버에서 안전하게 쿠키 설정
    if (result.ok === 1) {
      const cookieStore = await cookies();

      // 사용자 정보를 안전하게 쿠키에 저장 (httpOnly 옵션으로 XSS 방지)
      cookieStore.set(
        'user-auth',
        JSON.stringify({
          state: {
            user: result.item.user,
            isLoading: false,
            lastTokenRefresh: Date.now(),
          },
        }),
        {
          httpOnly: false, // zustand에서 접근해야 하므로 false
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24, // 1일
          path: '/',
        },
      );

      // 리프레시 토큰은 별도의 httpOnly 쿠키로 저장 (보안 강화)
      if (result.item.user.token?.refreshToken) {
        cookieStore.set('refresh-token', result.item.user.token.refreshToken, {
          httpOnly: true, // 클라이언트에서 접근 불가 (보안 강화)
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7, // 7일
          path: '/',
        });
      }
    }

    return result;
  } catch (error) {
    console.error('[로그인 액션] 오류:', error);
    return {
      ok: 0,
      message: '로그인 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 토큰 갱신 서버 액션
 * @param refreshToken - 리프레시 토큰 (선택사항, 없으면 쿠키에서 가져옴)
 * @returns 표준화된 API 응답 형태
 */
export async function refreshTokenAction(refreshToken?: string): Promise<ApiRes<{ accessToken: string }>> {
  try {
    const cookieStore = await cookies();

    // refreshToken이 제공되지 않으면 httpOnly 쿠키에서 가져오기
    const tokenToUse = refreshToken || cookieStore.get('refresh-token')?.value;

    if (!tokenToUse) {
      return {
        ok: 0,
        message: '리프레시 토큰이 없습니다.',
      };
    }

    // 서버 함수 호출
    const result = await refreshAccessToken(tokenToUse);

    // 토큰 갱신 성공 시 사용자 쿠키 업데이트
    if (result.ok === 1) {
      const userAuthCookie = cookieStore.get('user-auth')?.value;
      if (userAuthCookie) {
        try {
          const userData = JSON.parse(userAuthCookie);
          if (userData.state?.user?.token) {
            // 새로운 액세스 토큰으로 업데이트
            userData.state.user.token.accessToken = result.item.accessToken;
            userData.state.lastTokenRefresh = Date.now();

            cookieStore.set('user-auth', JSON.stringify(userData), {
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 60 * 60 * 24,
              path: '/',
            });
          }
        } catch (parseError) {
          console.error('[토큰 갱신 액션] 쿠키 파싱 오류:', parseError);
        }
      }
    }

    return result;
  } catch (error) {
    console.error('[토큰 갱신 액션] 오류:', error);
    return {
      ok: 0,
      message: '토큰 갱신 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 로그아웃 서버 액션
 * @param token - 인증 토큰 (선택사항, 없으면 쿠키에서 가져옴)
 * @returns 표준화된 API 응답 형태
 */
export async function logoutAction(token?: string): Promise<ApiRes<{ message: string }>> {
  try {
    const cookieStore = await cookies();

    // token이 제공되지 않으면 쿠키에서 가져오기
    let tokenToUse = token;
    if (!tokenToUse) {
      const userAuthCookie = cookieStore.get('user-auth')?.value;
      if (userAuthCookie) {
        try {
          const userData = JSON.parse(userAuthCookie);
          tokenToUse = userData.state?.user?.token?.accessToken;
        } catch (parseError) {
          console.error('[로그아웃 액션] 쿠키 파싱 오류:', parseError);
        }
      }
    }

    // 서버 함수 호출 (토큰이 없어도 로그아웃 처리)
    let result;
    if (tokenToUse) {
      result = await logoutUser(tokenToUse);
    } else {
      result = {
        ok: 1 as const,
        item: { message: '로컬 로그아웃 처리되었습니다.' },
      };
    }

    // 로그아웃 처리 후 모든 관련 쿠키 삭제
    cookieStore.delete('user-auth');
    cookieStore.delete('refresh-token');

    return result;
  } catch (error) {
    console.error('[로그아웃 액션] 오류:', error);

    // 에러가 발생해도 쿠키는 삭제
    const cookieStore = await cookies();
    cookieStore.delete('user-auth');
    cookieStore.delete('refresh-token');

    return {
      ok: 0,
      message: '로그아웃 처리 중 오류가 발생했습니다.',
    };
  }
}
