import { ApiRes } from '@/types/api.types';
import { LoginCredentials, LoginResult } from '@/types/auth.types';
import { User } from '@/types/user.types';

// 환경변수 설정 및 검증
class AuthConfig {
  private static instance: AuthConfig;
  private _apiBaseUrl: string;
  private _clientId: string;

  private constructor() {
    // 실제 환경변수 이름에 맞춰서 수정
    this._apiBaseUrl = this.validateEnvVar(process.env.NEXT_API_BASE_URL, 'NEXT_API_BASE_URL');
    this._clientId = this.validateEnvVar(process.env.NEXT_API_CLIENT_ID, 'NEXT_API_CLIENT_ID');
  }

  private validateEnvVar(value: string | undefined, name: string): string {
    if (!value || value.trim() === '') {
      throw new Error(`필수 환경변수가 설정되지 않았습니다: ${name}`);
    }
    return value.trim();
  }

  public static getInstance(): AuthConfig {
    if (!AuthConfig.instance) {
      AuthConfig.instance = new AuthConfig();
    }
    return AuthConfig.instance;
  }

  public get apiBaseUrl(): string {
    return this._apiBaseUrl;
  }

  public get clientId(): string {
    return this._clientId;
  }
}

// 환경변수 설정 인스턴스
const authConfig = AuthConfig.getInstance();

// 외부에서 사용할 수 있도록 export
export const API_BASE_URL = authConfig.apiBaseUrl;
export const CLIENT_ID = authConfig.clientId;

/**
 * 로그인 API 호출 함수
 * @param credentials - 로그인 자격 증명
 * @returns 표준화된 API 응답 형태
 */
export async function loginUser(credentials: LoginCredentials): Promise<LoginResult> {
  try {
    // 외부 API에 로그인 요청 (1일 만료)
    const res = await fetch(`${API_BASE_URL}/users/login?expiresIn=1d`, {
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
      // const user = validateAndTransformUser(apiUser); // 이 부분은 삭제됨
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
 * 로그아웃 API 호출 함수
 * @param token - 인증 토큰
 * @returns 표준화된 API 응답 형태
 */
export async function logoutUser(token: string): Promise<ApiRes<{ message: string }>> {
  try {
    if (!token) {
      return {
        ok: 0,
        message: '토큰이 제공되지 않았습니다.',
      };
    }

    // 외부 API에 로그아웃 요청
    const res = await fetch(`${API_BASE_URL}/users/logout`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID || '',
        Authorization: `Bearer ${token}`,
      },
    });

    // API 응답 처리
    if (!res.ok) {
      const errorData = await res.json();
      console.error('[로그아웃 함수] API 오류:', errorData);
      return {
        ok: 0,
        message: errorData.message || '로그아웃에 실패했습니다.',
      };
    }

    console.log('[로그아웃 함수] 성공');
    return {
      ok: 1,
      item: { message: '성공적으로 로그아웃되었습니다.' },
    };
  } catch (error) {
    console.error('[로그아웃 함수] 오류:', error);
    return {
      ok: 0,
      message: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 토큰 갱신 API 호출 함수
 * @param refreshToken - 리프레시 토큰
 * @returns 표준화된 API 응답 형태
 */
export async function refreshAccessToken(refreshToken: string): Promise<ApiRes<{ accessToken: string }>> {
  try {
    if (!refreshToken) {
      return {
        ok: 0,
        message: '리프레시 토큰이 제공되지 않았습니다.',
      };
    }

    const res = await fetch(`${API_BASE_URL}/users/refresh`, {
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

/**
 * JWT 토큰 만료 시간 확인
 * @param token - JWT 토큰
 * @returns 토큰이 만료되었는지 여부
 */
export function isTokenExpired(token: string): boolean {
  try {
    // JWT 토큰의 payload 부분 디코딩 (base64)
    const payload = token.split('.')[1];
    if (!payload) return true;

    const decodedPayload = JSON.parse(atob(payload));
    const currentTime = Math.floor(Date.now() / 1000);

    // exp 필드가 있고 현재 시간보다 이전이면 만료
    return decodedPayload.exp && decodedPayload.exp < currentTime;
  } catch (error) {
    console.error('[토큰 검증] 토큰 파싱 오류:', error);
    return true; // 파싱 에러가 발생하면 만료된 것으로 간주
  }
}

/**
 * 토큰이 곧 만료될지 확인 (5분 전)
 * @param token - JWT 토큰
 * @returns 토큰이 곧 만료될지 여부
 */
export function isTokenExpiringSoon(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;

    const decodedPayload = JSON.parse(atob(payload));
    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutesFromNow = currentTime + 5 * 60; // 5분 후

    // 5분 이내에 만료되면 true
    return decodedPayload.exp && decodedPayload.exp < fiveMinutesFromNow;
  } catch (error) {
    console.error('[토큰 검증] 토큰 파싱 오류:', error);
    return true;
  }
}
