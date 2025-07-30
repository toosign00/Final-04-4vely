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
  rememberLogin?: boolean;
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
 * 회원가입 관련 타입 정의
 * ===========================
 */

/** Step 1 약관 동의 데이터 */
export interface Step1Data {
  agreeTerms: boolean;
  agreePrivacy: boolean;
}

/** Step 2 필수 정보 데이터 */
export interface Step2Data {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  zipcode: string;
  address: string;
  addressDetail: string;
}

/** Step 3 추가 정보 데이터 */
export interface Step3Data {
  image?: File;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  interests?: string[];
}

/** 통합 회원가입 폼 데이터 */
export interface SignUpFormData extends Step1Data, Step2Data, Step3Data {}

/** 단계별 회원가입 상태 */
export interface WizardState {
  currentStep: number;
  step1Data: Partial<Step1Data>;
  step2Data: Partial<Step2Data>;
  step3Data: Partial<Step3Data>;
  isStepValid: Record<number, boolean>;
}

/** 회원가입 요청 데이터 */
export interface SignUpRequestData {
  type: 'user';
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  image: string;
  extra?: {
    gender?: 'male' | 'female' | 'other';
    birthDate?: string;
  };
}

/** 회원가입 폼 검증 에러 */
export interface SignUpFormErrors {
  // Step 1 에러
  agreeTerms?: string;
  agreePrivacy?: string;
  // Step 2 에러
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  zipcode?: string;
  address?: string;
  addressDetail?: string;
  // Step 3 에러
  image?: string;
  gender?: string;
  birthDate?: string;
  interests?: string;
}

/** 단계별 검증 에러 */
export interface StepErrors {
  step1?: Partial<Pick<SignUpFormErrors, 'agreeTerms' | 'agreePrivacy'>>;
  step2?: Partial<Pick<SignUpFormErrors, 'name' | 'email' | 'password' | 'confirmPassword' | 'phone' | 'zipcode' | 'address' | 'addressDetail'>>;
  step3?: Partial<Pick<SignUpFormErrors, 'image' | 'gender' | 'birthDate' | 'interests'>>;
}

/** 회원가입 상태 */
export interface SignUpState {
  isLoading: boolean;
  error: string | null;
  fieldErrors: SignUpFormErrors | null;
  isEmailChecking: boolean;
  isNicknameChecking: boolean;
  emailAvailable: boolean | null;
  nicknameAvailable: boolean | null;
}

/** 회원가입 결과 (API 응답 타입 활용) */
export type SignUpResult = import('@/types/api.types').ApiRes<User, SignUpFormErrors>;

/** 이메일 중복 확인 결과 */
export type EmailCheckResult = import('@/types/api.types').ApiRes<{ available: boolean }>;

/** 닉네임 중복 확인 결과 */
export type NicknameCheckResult = import('@/types/api.types').ApiRes<{ available: boolean }>;

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
