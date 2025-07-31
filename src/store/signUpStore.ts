import type { PersonalInfoData, ProfileSetupData, SignUpFormErrors, TermsAgreementData } from '@/app/(auth)/sign-up/_types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WizardState {
  currentStep: number; // 현재 진행 중인 단계
  step1Data: Partial<TermsAgreementData>; // 약관 동의 데이터
  step2Data: Partial<PersonalInfoData>; // 개인 정보 데이터
  step3Data: Partial<ProfileSetupData>; // 프로필 설정 데이터
  isStepValid: Record<number, boolean>; // 각 단계의 유효성 여부
}

export interface RedirectionState {
  isRedirecting: boolean; // 리디렉션 진행 중인지 여부
  redirectionTarget: string | null; // 리디렉션 대상 경로
}

export interface SignUpState {
  isLoading: boolean; // 로딩 상태
  error: string | null; // 에러 메시지
  fieldErrors: SignUpFormErrors | null; // 필드 에러 메시지
  isEmailChecking: boolean; // 이메일 중복 체크 상태
  isNicknameChecking: boolean; // 닉네임 중복 체크 상태
  emailAvailable: boolean | null; // 이메일 사용 가능 여부
  nicknameAvailable: boolean | null; // 닉네임 사용 가능 여부
}

interface SignUpStore extends WizardState, SignUpState, RedirectionState {
  // 회원가입 폼 관련 액션
  setCurrentStep: (step: number) => void; // 현재 진행 중인 단계 설정
  setStep1Data: (data: Partial<TermsAgreementData>) => void; // 약관 동의 데이터 설정
  setStep2Data: (data: Partial<PersonalInfoData>) => void; // 개인 정보 데이터 설정
  setStep3Data: (data: Partial<ProfileSetupData>) => void; // 프로필 설정 데이터 설정
  setStepValid: (step: number, isValid: boolean) => void; // 각 단계의 유효성 여부 설정

  // 회원가입 폼 관련 상태
  setLoading: (loading: boolean) => void; // 로딩 상태 설정
  setError: (error: string | null) => void; // 에러 메시지 설정
  setFieldErrors: (errors: SignUpFormErrors | null) => void; // 필드 에러 메시지 설정
  setEmailChecking: (checking: boolean) => void; // 이메일 중복 체크 상태 설정
  setNicknameChecking: (checking: boolean) => void; // 닉네임 중복 체크 상태 설정
  setEmailAvailable: (available: boolean | null) => void; // 이메일 사용 가능 여부 설정
  setNicknameAvailable: (available: boolean | null) => void; // 닉네임 사용 가능 여부 설정

  // 리디렉션 관련 액션
  startRedirection: (target: string) => void; // 리디렉션 시작
  finishRedirection: () => void; // 리디렉션 완료

  // 유틸리티 액션
  reset: () => void; // 회원가입 폼 초기화
  isStepUnlocked: (step: number) => boolean; // 각 단계의 잠금 여부 확인
}

const initialWizardState: WizardState = {
  currentStep: 1,
  step1Data: {},
  step2Data: {},
  step3Data: {},
  isStepValid: {},
};

const initialRedirectionState: RedirectionState = {
  isRedirecting: false,
  redirectionTarget: null,
};

const initialSignUpState: SignUpState = {
  isLoading: false,
  error: null,
  fieldErrors: null,
  isEmailChecking: false,
  isNicknameChecking: false,
  emailAvailable: null,
  nicknameAvailable: null,
};

export const useSignUpStore = create<SignUpStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialWizardState,
      ...initialSignUpState,
      ...initialRedirectionState,

      // Wizard actions
      setCurrentStep: (step) => set({ currentStep: step }),
      setStep1Data: (data) =>
        set((state) => ({
          step1Data: { ...state.step1Data, ...data },
        })),
      setStep2Data: (data) =>
        set((state) => ({
          step2Data: { ...state.step2Data, ...data },
        })),
      setStep3Data: (data) =>
        set((state) => ({
          step3Data: { ...state.step3Data, ...data },
        })),
      setStepValid: (step, isValid) =>
        set((state) => ({
          isStepValid: { ...state.isStepValid, [step]: isValid },
        })),

      // SignUp actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setFieldErrors: (errors) => set({ fieldErrors: errors }),
      setEmailChecking: (checking) => set({ isEmailChecking: checking }),
      setNicknameChecking: (checking) => set({ isNicknameChecking: checking }),
      setEmailAvailable: (available) => set({ emailAvailable: available }),
      setNicknameAvailable: (available) => set({ nicknameAvailable: available }),

      // Redirection actions
      startRedirection: (target) => {
        set({ isRedirecting: true, redirectionTarget: target });
      },
      finishRedirection: () => {
        set({ isRedirecting: false, redirectionTarget: null });
      },

      // Utility actions
      reset: () => {
        // 메모리 상태 초기화 (리디렉션 상태는 유지)
        set((state) => ({
          ...initialWizardState,
          ...initialSignUpState,
          // 리디렉션 상태는 유지
          isRedirecting: state.isRedirecting,
          redirectionTarget: state.redirectionTarget,
        }));
      },

      isStepUnlocked: (step) => {
        const state = get();
        switch (step) {
          case 1:
            return true;
          case 2:
            return state.isStepValid[1] === true;
          case 3:
            return state.isStepValid[1] === true && state.isStepValid[2] === true;
          default:
            return false;
        }
      },
    }),
    {
      name: 'signup-storage',
      // 리디렉션 상태는 persist에서 제외 (새로고침 시 자동 초기화)
      partialize: (state) => ({
        currentStep: state.currentStep,
        step1Data: state.step1Data,
        step2Data: state.step2Data,
        step3Data: state.step3Data,
        isStepValid: state.isStepValid,
        // isLoading, error, fieldErrors 등은 세션 상태이므로 persist하지 않음
        // isRedirecting, redirectionTarget도 persist하지 않음 (새로고침 시 자동 초기화)
      }),
    },
  ),
);
