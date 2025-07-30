'use client';

import { checkEmailAction, checkNicknameAction, signUpAction } from '@/lib/functions/authFunctions';
import { step1Schema, step2Schema, step3Schema } from '@/lib/schemas/signUpSchema';
import { SignUpFormErrors, SignUpState, Step1Data, Step2Data, Step3Data, WizardState } from '@/types/auth.types';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export function useSignUpForm() {
  const router = useRouter();

  // 폼 상태
  const form = useForm({
    mode: 'onChange',
  });

  // 위저드 상태
  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 1,
    step1Data: {},
    step2Data: {},
    step3Data: {},
    isStepValid: {},
  });

  // 회원가입 상태
  const [signUpState, setSignUpState] = useState<SignUpState>({
    isLoading: false,
    error: null,
    fieldErrors: null,
    isEmailChecking: false,
    isNicknameChecking: false,
    emailAvailable: null,
    nicknameAvailable: null,
  });

  // 상태 getter들
  const { isLoading, isEmailChecking, isNicknameChecking, emailAvailable, nicknameAvailable } = signUpState;
  const { formState } = form;

  // 단계별 데이터 저장
  const saveStepData = useCallback((step: number, data: Step1Data | Step2Data | Step3Data) => {
    setWizardState((prev) => ({
      ...prev,
      [`step${step}Data`]: data,
    }));
  }, []);

  // 단계별 유효성 검증
  const validateStep = useCallback((step: number, data: Step1Data | Step2Data | Step3Data): boolean => {
    try {
      switch (step) {
        case 1:
          step1Schema.parse(data);
          break;
        case 2:
          step2Schema.parse(data);
          break;
        case 3:
          step3Schema.parse(data);
          break;
        default:
          return false;
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: SignUpFormErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof SignUpFormErrors] = err.message;
          }
        });
        setSignUpState((prev) => ({ ...prev, fieldErrors: errors }));
      }
      return false;
    }
  }, []);

  // 단계 유효성 업데이트
  const updateStepValidity = useCallback((step: number, isValid: boolean) => {
    setWizardState((prev) => ({
      ...prev,
      isStepValid: { ...prev.isStepValid, [step]: isValid },
    }));
  }, []);

  // 다음 단계로 이동
  const nextStep = useCallback(() => {
    setWizardState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 3),
    }));
    setSignUpState((prev) => ({ ...prev, fieldErrors: null }));
  }, []);

  // 이전 단계로 이동
  const prevStep = useCallback(() => {
    setWizardState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
    setSignUpState((prev) => ({ ...prev, fieldErrors: null }));
  }, []);

  // 이메일 중복 체크
  const checkEmailAvailability = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) return;

    setSignUpState((prev) => ({ ...prev, isEmailChecking: true, emailAvailable: null }));

    try {
      const result = await checkEmailAction(email);

      if (result.ok === 1) {
        setSignUpState((prev) => ({
          ...prev,
          emailAvailable: result.item?.available ?? false,
        }));
      } else {
        setSignUpState((prev) => ({
          ...prev,
          emailAvailable: false,
        }));
      }
    } catch (error) {
      console.error('이메일 중복 체크 실패:', error);
      setSignUpState((prev) => ({
        ...prev,
        emailAvailable: false,
      }));
    } finally {
      setSignUpState((prev) => ({ ...prev, isEmailChecking: false }));
    }
  }, []);

  // 닉네임 중복 체크
  const checkNicknameAvailability = useCallback(async (nickname: string) => {
    if (!nickname || nickname.length < 2) return;

    setSignUpState((prev) => ({ ...prev, isNicknameChecking: true, nicknameAvailable: null }));

    try {
      const result = await checkNicknameAction(nickname);

      if (result.ok === 1) {
        setSignUpState((prev) => ({
          ...prev,
          nicknameAvailable: result.item?.available ?? false,
        }));
      } else {
        setSignUpState((prev) => ({
          ...prev,
          nicknameAvailable: false,
        }));
      }
    } catch (error) {
      console.error('닉네임 중복 체크 실패:', error);
      setSignUpState((prev) => ({
        ...prev,
        nicknameAvailable: false,
      }));
    } finally {
      setSignUpState((prev) => ({ ...prev, isNicknameChecking: false }));
    }
  }, []);

  // 회원가입 처리
  const handleSignUp = useCallback(
    async (step3Data: Step3Data) => {
      setSignUpState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // 모든 단계 데이터 수집
        const allData = {
          ...wizardState.step1Data,
          ...wizardState.step2Data,
          ...step3Data,
        };

        // 최종 검증
        if (!validateStep(1, wizardState.step1Data as Step1Data) || !validateStep(2, wizardState.step2Data as Step2Data) || !validateStep(3, step3Data)) {
          throw new Error('입력 정보를 다시 확인해주세요.');
        }

        // 파일 업로드 처리 (필요시)
        const imageUrl = '';
        if (step3Data.image) {
          // 파일 업로드 로직은 별도로 구현 필요
          console.log('파일 업로드 필요:', step3Data.image);
        }

        // 회원가입 데이터 준비
        const signUpData = {
          type: 'user' as const,
          name: allData.name || '',
          email: allData.email || '',
          password: allData.password || '',
          phone: allData.phone || '',
          address: `${allData.address || ''} ${allData.addressDetail || ''}`,
          image: imageUrl,
          extra: {
            gender: step3Data.gender,
            birthDate: step3Data.birthDate,
          },
        };

        // 서버 액션으로 회원가입 처리
        const result = await signUpAction(signUpData);

        if (result.ok === 1) {
          console.log('회원가입 성공:', result);

          // 성공 시 로그인 페이지로 이동
          router.push('/login?message=회원가입이 완료되었습니다. 로그인해주세요.');
        } else {
          throw new Error(result.message || '회원가입에 실패했습니다.');
        }
      } catch (error) {
        console.error('회원가입 실패:', error);
        setSignUpState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : '회원가입에 실패했습니다.',
        }));
      } finally {
        setSignUpState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [wizardState, validateStep, router],
  );

  // 폼 값 설정
  const setValue = useCallback(
    (name: string, value: string | boolean | File | string[] | undefined) => {
      form.setValue(name, value);
    },
    [form],
  );

  // 에러 클리어
  const clearErrors = useCallback(() => {
    form.clearErrors();
    setSignUpState((prev) => ({ ...prev, fieldErrors: null, error: null }));
  }, [form]);

  return {
    // 기본 상태
    setValue,
    clearErrors,
    formState,
    isLoading,
    isEmailChecking,
    isNicknameChecking,
    emailAvailable,
    nicknameAvailable,

    // 단계 관리
    wizardState,
    saveStepData,
    validateStep,
    updateStepValidity,
    nextStep,
    prevStep,

    // 기능
    checkEmailAvailability,
    checkNicknameAvailability,
    handleSignUp,
  };
}
