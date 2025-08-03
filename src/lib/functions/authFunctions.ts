'use server';

import { ApiRes } from '@/types/api.types';
import { LoginCredentials, LoginResult } from '@/types/auth.types';
import { User } from '@/types/user.types';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || '';
const CLIENT_ID = process.env.CLIENT_ID || '';

// ============================================================================
// 서버 액션 (클라이언트에서 호출 가능)
// ============================================================================

/**
 * 로그인 서버 액션
 * 폼 제출을 처리하고 사용자 인터랙션에 응답
 * @param credentials - 로그인 자격 증명
 * @returns 표준화된 API 응답 형태
 */
export async function loginAction(credentials: LoginCredentials): Promise<LoginResult> {
  try {
    // 내부 함수 호출
    const result = await loginUser(credentials);

    // 로그인 성공 시 서버에서 안전하게 쿠키 설정
    if (result.ok === 1) {
      const cookieStore = await cookies();

      // rememberLogin 값에 따라 만료시간 분기
      const userAuthMaxAge = credentials.rememberLogin ? 60 * 60 * 24 * 7 : 60 * 60 * 24; // 7일 or 1일
      const refreshTokenMaxAge = credentials.rememberLogin ? 60 * 60 * 24 * 14 : 60 * 60 * 24 * 7; // 14일 or 7일

      // 만료시간을 일(day) 단위로 콘솔에 출력
      console.log('[쿠키 만료시간] user-auth:', userAuthMaxAge / (60 * 60 * 24), '일');
      console.log('[쿠키 만료시간] refresh-token:', refreshTokenMaxAge / (60 * 60 * 24), '일');

      // 사용자 정보를 안전하게 쿠키에 저장 (httpOnly 옵션으로 XSS 방지)
      cookieStore.set(
        'user-auth',
        JSON.stringify({
          state: {
            user: {
              _id: result.item.user._id,
              email: result.item.user.email,
              name: result.item.user.name,
              type: result.item.user.type,
              createdAt: result.item.user.createdAt,
              updatedAt: result.item.user.updatedAt,
              token: {
                accessToken: result.item.user.token?.accessToken,
              },
            },
            isLoading: false,
            lastTokenRefresh: Date.now(),
          },
        }),
        {
          httpOnly: false, // zustand에서 접근해야 하므로 false
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: userAuthMaxAge, // 7일 or 1일
          path: '/',
        },
      );

      // 리프레시 토큰은 별도의 httpOnly 쿠키로 저장 (보안 강화)
      if (result.item.user.token?.refreshToken) {
        cookieStore.set('refresh-token', result.item.user.token.refreshToken, {
          httpOnly: true, // 클라이언트에서 접근 불가 (보안 강화)
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: refreshTokenMaxAge, // 14일 or 7일
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

    // 내부 함수 호출
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
export async function logoutAction(): Promise<ApiRes<{ message: string }>> {
  try {
    const cookieStore = await cookies();

    // 로그아웃 처리: 쿠키만 삭제
    cookieStore.delete('user-auth');
    cookieStore.delete('refresh-token');

    return {
      ok: 1,
      item: { message: '로그아웃 처리되었습니다.' },
    };
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




// ============================================================================
// 내부 함수들 (서버 액션에서만 사용)
// ============================================================================

/**
 * 로그인 API 호출 함수
 * @param credentials - 로그인 자격 증명
 * @returns 표준화된 API 응답 형태
 */
async function loginUser(credentials: LoginCredentials): Promise<LoginResult> {
  try {
    // 외부 API에 로그인 요청 (만료 시간 1일)
    const res = await fetch(`${API_URL}/users/login?expiresIn=1d`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
      },
      body: JSON.stringify(credentials),
    });

    // API 응답 처리
    const data = await res.json();

    if (!res.ok) {
      console.error('[로그인 함수] API 오류:', data);
      return {
        ok: 0,
        message: data.message || '로그인에 실패했습니다.',
        errors: data.errors,
      };
    }

    // API 응답 데이터 검증
    const user: User = data.item;
    if (!user) {
      return {
        ok: 0,
        message: '로그인 정보가 올바르지 않습니다.',
      };
    }

    try {
      // 타입 안전성을 보장하는 변환
      const token = user.token?.accessToken;

      if (!token) {
        return {
          ok: 0,
          message: '인증 토큰을 가져올 수 없습니다.',
        };
      }

      console.log('[로그인 함수] 성공:', { userId: user._id, email: user.email });
      return {
        ok: 1,
        item: { user, token },
      };
    } catch (validationError) {
      console.error('[로그인 함수] 데이터 검증 오류:', validationError);
      return {
        ok: 0,
        message: validationError instanceof Error ? validationError.message : '사용자 데이터가 유효하지 않습니다.',
      };
    }
  } catch (error) {
    console.error('[로그인 함수] 네트워크 오류:', error);
    return {
      ok: 0,
      message: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}

/**
 * 토큰 갱신 API 호출 함수
 * @param refreshToken - 리프레시 토큰
 * @returns 표준화된 API 응답 형태
 */
async function refreshAccessToken(refreshToken: string): Promise<ApiRes<{ accessToken: string }>> {
  try {
    if (!refreshToken) {
      return {
        ok: 0,
        message: '리프레시 토큰이 제공되지 않았습니다.',
      };
    }

    const res = await fetch(`${API_URL}/users/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[토큰 갱신 함수] API 오류:', data);
      return {
        ok: 0,
        message: data.message || '토큰 갱신에 실패했습니다.',
      };
    }

    const newAccessToken = data.item?.accessToken;
    if (!newAccessToken) {
      return {
        ok: 0,
        message: '새로운 액세스 토큰을 가져올 수 없습니다.',
      };
    }

    console.log('[토큰 갱신 함수] 성공');
    return {
      ok: 1,
      item: { accessToken: newAccessToken },
    };
  } catch (error) {
    console.error('[토큰 갱신 함수] 오류:', error);
    return {
      ok: 0,
      message: '토큰 갱신 중 서버 오류가 발생했습니다.',
    };
  }
}



