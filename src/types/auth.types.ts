import { User } from '@/types/user.types';

/**
 * ===========================
 * 인증/로그인 관련 타입 정의
 * ===========================
 */

/** 로그인 자격 증명 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** 로그인 폼 데이터 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberLogin: boolean;
}

/** 로그인 폼 검증 에러 */
export interface LoginFormErrors {
  email?: string;
  password?: string;
}

/** 로그인 상태 */
export interface LoginState {
  isLoading: boolean;
  error: string | null;
  fieldErrors: LoginFormErrors | null;
}

/** 로그인 응답 데이터 */
export interface LoginResponse {
  user: User;
  token: string;
}

/** 로그인 결과 (API 응답 타입 활용) */
export type LoginResult = import('@/types/api.types').ApiRes<LoginResponse, LoginFormErrors>;

/**
 * ===========================
 * 토큰/네트워크 관련 타입
 * ===========================
 */

/** 리프레시 토큰 결과 */
export interface RefreshTokenResult {
  ok: number;
  message?: string;
  item: {
    accessToken: string;
  };
}

/** 네트워크 에러 */
export interface NetworkError {
  status?: number;
  message?: string;
}
