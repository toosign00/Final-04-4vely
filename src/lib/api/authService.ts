import { LoginCredentials, LoginResponse, isValidLoginResponse, isValidUserResponse } from '@/types/auth.types';

/**
 * 인증 관련 API 서비스 클래스
 */
export class AuthService {
  /**
   * 로그인 API 호출
   * @param credentials - 로그인 자격 증명
   * @returns 로그인 응답 데이터
   * @throws ApiError - 로그인 실패 시
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      // Next.js API route에서 이미 변환된 응답 구조 검증
      if (!isValidLoginResponse(data)) {
        throw new Error('잘못된 로그인 응답 형식입니다.');
      }

      // 이미 올바른 형태이므로 그대로 반환
      return data;
    } catch (error) {
      console.error('[로그인 API] 오류:', error);
      throw error instanceof Error ? error : new Error('로그인 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 로그아웃 API 호출
   * @param token - 인증 토큰
   * @throws ApiError - 로그아웃 실패 시
   */
  static async logout(token: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '로그아웃에 실패했습니다.');
      }
    } catch (error) {
      console.error('[로그아웃 API] 오류:', error);
      throw error instanceof Error ? error : new Error('로그아웃 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 토큰 검증 API 호출
   * @param token - 검증할 토큰
   * @returns 사용자 정보
   * @throws ApiError - 토큰 검증 실패 시
   */
  static async verifyToken(token: string): Promise<LoginResponse['user']> {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('토큰이 유효하지 않습니다.');
      }

      const data = await response.json();

      // 타입 안전성 검증
      if (!isValidUserResponse(data)) {
        throw new Error('잘못된 사용자 응답 형식입니다.');
      }

      return data.user;
    } catch (error) {
      console.error('[토큰 검증 API] 오류:', error);
      throw error instanceof Error ? error : new Error('토큰 검증 처리 중 오류가 발생했습니다.');
    }
  }
}
