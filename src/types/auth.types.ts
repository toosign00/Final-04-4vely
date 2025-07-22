// 로그인 자격 증명 타입
export interface LoginCredentials {
  email: string;
  password: string;
}

// 로그인 폼 데이터 타입 (UI에서 사용)
export interface LoginFormData extends LoginCredentials {
  rememberLogin: boolean;
}

// 토큰 정보 타입
export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
}

// 사용자 정보 타입 (실제 API 응답에 맞게)
export interface UserInfo {
  _id: number; // API에서 숫자로 반환
  email: string;
  name: string;
  phone: string;
  address: string;
  type: string; // "user" | "admin" 등
  loginType: string; // "email" 등
  image: string;
  createdAt: string;
  updatedAt: string;
  extra?: Record<string, unknown>;
  notifications?: unknown[];
  token: TokenInfo; // 토큰 정보
}

// 실제 API 응답 타입
export interface ApiLoginResponse {
  ok: number;
  item: UserInfo;
}

// 프론트엔드에서 사용하는 로그인 응답 타입 (변환 후)
export interface LoginResponse {
  user: UserInfo;
  token: string;
}

// API 에러 응답 타입
export interface ApiError {
  error: string;
  status?: number;
}

// 폼 검증 결과 타입
export interface ValidationResult {
  isValid: boolean;
  errors: {
    email?: string;
    password?: string;
    general?: string;
  };
}

// 타입 가드 함수들
export const isValidTokenInfo = (data: unknown): data is TokenInfo => {
  const token = data as TokenInfo;
  return typeof data === 'object' && data !== null && typeof token.accessToken === 'string' && typeof token.refreshToken === 'string';
};

export const isValidUserInfo = (data: unknown): data is UserInfo => {
  const user = data as UserInfo;
  return (
    typeof data === 'object' && data !== null && typeof user._id === 'number' && typeof user.email === 'string' && typeof user.name === 'string' && typeof user.token === 'object' && user.token !== null && typeof user.token.accessToken === 'string'
    // 나머지 필드는 선택적으로 허용
  );
};

export const isValidApiLoginResponse = (data: unknown): data is ApiLoginResponse => {
  const response = data as ApiLoginResponse;
  return typeof data === 'object' && data !== null && typeof response.ok === 'number' && 'item' in response && isValidUserInfo(response.item);
};

export const isValidLoginResponse = (data: unknown): data is LoginResponse => {
  const response = data as LoginResponse;
  return typeof data === 'object' && data !== null && 'user' in response && 'token' in response && isValidUserInfo(response.user) && typeof response.token === 'string';
};

export const isValidUserResponse = (data: unknown): data is { user: UserInfo } => {
  return typeof data === 'object' && data !== null && 'user' in data && isValidUserInfo((data as { user: UserInfo }).user);
};
