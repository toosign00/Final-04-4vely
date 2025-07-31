'use client';

import { uploadFile } from '@/lib/actions/fileActions';
import { checkEmailAction, checkNicknameAction, signUpAction } from '@/lib/functions/authFunctions';
import { useSignUpStore } from '@/store/signUpStore';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { step1Schema, step2Schema, step3Schema } from '../_schemas';
import { PersonalInfoData, ProfileSetupData, SignUpFormErrors, TermsAgreementData } from '../_types';

export function useSignUpForm() {
  // 폼 상태
  const form = useForm({
    mode: 'onChange',
  });

  // Zustand 스토어에서 상태 가져오기
  const { step1Data, step2Data, isLoading, fieldErrors, isEmailChecking, isNicknameChecking, emailAvailable, nicknameAvailable, setLoading, setFieldErrors, setEmailChecking, setNicknameChecking, setEmailAvailable, setNicknameAvailable, setError } =
    useSignUpStore();

  const { formState } = form;

  // 단계별 유효성 검증
  const validateStep = useCallback(
    (step: number, data: TermsAgreementData | PersonalInfoData | ProfileSetupData): boolean => {
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
          setFieldErrors(errors);
        }
        return false;
      }
    },
    [setFieldErrors],
  );

  // 이메일 중복 체크
  const checkEmailAvailability = useCallback(
    async (email: string) => {
      if (!email || !email.includes('@')) return;

      setEmailChecking(true);
      setEmailAvailable(null);

      try {
        const result = await checkEmailAction(email);

        if (result.ok === 1) {
          setEmailAvailable(result.item?.available ?? false);
        } else {
          setEmailAvailable(false);
        }
      } catch (error) {
        console.error('이메일 중복 체크 실패:', error);
        toast.error('이메일 중복 체크 실패');
        setEmailAvailable(false);
      } finally {
        setEmailChecking(false);
      }
    },
    [setEmailChecking, setEmailAvailable],
  );

  // 닉네임 중복 체크
  const checkNicknameAvailability = useCallback(
    async (nickname: string) => {
      if (!nickname || nickname.length < 2) return;

      setNicknameChecking(true);
      setNicknameAvailable(null);

      try {
        const result = await checkNicknameAction(nickname);

        if (result.ok === 1) {
          setNicknameAvailable(result.item?.available ?? false);
        } else {
          setNicknameAvailable(false);
        }
      } catch (error) {
        console.error('닉네임 중복 체크 실패:', error);
        toast.error('닉네임 중복 체크 실패');
        setNicknameAvailable(false);
      } finally {
        setNicknameChecking(false);
      }
    },
    [setNicknameChecking, setNicknameAvailable],
  );

  // 회원가입 처리
  const handleSignUp = useCallback(
    async (step3Data: ProfileSetupData) => {
      setLoading(true);
      setError(null);

      try {
        // 모든 단계 데이터 수집
        const allData = {
          ...step1Data,
          ...step2Data,
          ...step3Data,
        };

        // 최종 검증
        if (!validateStep(1, step1Data as TermsAgreementData) || !validateStep(2, step2Data as PersonalInfoData) || !validateStep(3, step3Data)) {
          throw new Error('입력 정보를 다시 확인해주세요.');
        }

        let imageUrl = '';
        if (step3Data.image) {
          const formData = new FormData();
          formData.append('attach', step3Data.image);
          const uploadResult = await uploadFile(formData);
          if (uploadResult.ok === 1 && uploadResult.item?.[0]?.path) {
            imageUrl = uploadResult.item[0].path;
          } else {
            throw new Error('이미지 업로드에 실패했습니다.');
          }
        }

        // 회원가입 데이터 준비
        const signUpData = {
          type: 'user' as const,
          name: allData.name || '',
          email: allData.email || '',
          password: allData.password || '',
          phone: allData.phone || '',
          address: `${allData.address || ''} ${allData.addressDetail || ''}`,
          image: imageUrl || undefined,
          extra:
            step3Data.gender || step3Data.birthDate
              ? {
                  gender: step3Data.gender || undefined,
                  birthDate: step3Data.birthDate || undefined,
                }
              : undefined,
        };

        // 서버 액션으로 회원가입 처리
        const result = await signUpAction(signUpData);

        if (result.ok === 1) {
          return { success: true, message: '회원가입이 완료되었습니다!' };
        } else {
          throw new Error(result.message || '회원가입에 실패했습니다.');
        }
      } catch (error) {
        console.error('회원가입 실패:', error);
        toast.error('회원가입에 실패했습니다.');
        setError(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [step1Data, step2Data, validateStep, setLoading, setError],
  );

  // 폼 값 설정
  const setValue = useCallback(
    (name: string, value: string | boolean | File | string[] | undefined) => {
      form.setValue(name, value);
    },
    [form],
  );

  // 개별 필드 실시간 검증
  const validateField = useCallback((field: keyof PersonalInfoData, value: string, formData?: PersonalInfoData): string | null => {
    try {
      // 개별 필드 스키마 정의
      const fieldSchemas = {
        name: z.string().min(2, '이름은 2자 이상이어야 합니다.').max(50, '이름은 50자 이하여야 합니다.'),
        email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
        password: z
          .string()
          .min(8, '비밀번호는 8자 이상이어야 합니다.')
          .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.'),
        confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
        phone: z.string().regex(/^010\d{8}$/, '휴대폰 번호는 01012345678 형식으로 입력해주세요.'),
        postalCode: z.string().min(1, '우편번호를 선택해주세요.'),
        address: z.string().min(1, '주소를 선택해주세요.'),
        addressDetail: z
          .string()
          .min(5, '상세주소는 5자 이상 입력해주세요.')
          .refine((val) => val.trim().length >= 5, '상세주소는 5자 이상 입력해주세요.'),
      };

      // 해당 필드 검증
      const fieldSchema = fieldSchemas[field];
      if (!fieldSchema) return null;

      fieldSchema.parse(value);

      // 비밀번호 확인의 경우 비밀번호와 일치하는지 추가 검증
      if (field === 'confirmPassword' && formData?.password && value !== formData.password) {
        return '비밀번호가 일치하지 않습니다.';
      }

      return null; // 에러 없음
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || '유효하지 않은 값입니다.';
      }
      return '유효하지 않은 값입니다.';
    }
  }, []);

  // 에러 클리어
  const clearErrors = useCallback(() => {
    form.clearErrors();
    setFieldErrors(null);
    setError(null);
  }, [form, setFieldErrors, setError]);

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
    fieldErrors,

    // 기능
    validateStep,
    validateField, // 실시간 검증 함수 추가
    checkEmailAvailability,
    checkNicknameAvailability,
    handleSignUp,
  };
}
