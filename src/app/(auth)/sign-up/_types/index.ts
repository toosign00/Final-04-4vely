/**
 * ===========================
 * 회원가입 관련 타입 정의
 * ===========================
 */

/** 약관 동의 데이터 */
export interface TermsAgreementData {
  agreeTerms: boolean;
  agreePrivacy: boolean;
}

/** 개인정보 입력 데이터 */
export interface PersonalInfoData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  postalCode: string;
  address: string;
  addressDetail: string;
}

/** 프로필 설정 데이터 */
export interface ProfileSetupData {
  image?: File;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  interests?: string[];
}

/** 통합 회원가입 폼 데이터 */
export interface SignUpFormData extends TermsAgreementData, PersonalInfoData, ProfileSetupData {}

/** 단계별 회원가입 상태 */
export interface WizardState {
  currentStep: number;
  termsAgreementData: Partial<TermsAgreementData>;
  personalInfoData: Partial<PersonalInfoData>;
  profileSetupData: Partial<ProfileSetupData>;
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
  // 약관 동의 에러
  agreeTerms?: string;
  agreePrivacy?: string;
  // 개인정보 에러
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  postalCode?: string;
  address?: string;
  addressDetail?: string;
  // 프로필 설정 에러
  image?: string;
  gender?: string;
  birthDate?: string;
  interests?: string;
}

/** 단계별 검증 에러 */
export interface StepValidationErrors {
  termsAgreement?: Partial<Pick<SignUpFormErrors, 'agreeTerms' | 'agreePrivacy'>>;
  personalInfo?: Partial<Pick<SignUpFormErrors, 'name' | 'email' | 'password' | 'confirmPassword' | 'phone' | 'postalCode' | 'address' | 'addressDetail'>>;
  profileSetup?: Partial<Pick<SignUpFormErrors, 'image' | 'gender' | 'birthDate' | 'interests'>>;
}

// 기존 타입과의 호환성
/** @deprecated StepValidationErrors를 사용하세요 */
export interface StepErrors {
  step1?: Partial<Pick<SignUpFormErrors, 'agreeTerms' | 'agreePrivacy'>>;
  step2?: Partial<Pick<SignUpFormErrors, 'name' | 'email' | 'password' | 'confirmPassword' | 'phone' | 'postalCode' | 'address' | 'addressDetail'>>;
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
export type SignUpResult = import('@/types/api.types').ApiRes<import('@/types/user.types').User, SignUpFormErrors>;

/** 이메일 중복 확인 결과 */
export type EmailCheckResult = import('@/types/api.types').ApiRes<{ available: boolean }>;

/** 닉네임 중복 확인 결과 */
export type NicknameCheckResult = import('@/types/api.types').ApiRes<{ available: boolean }>;
