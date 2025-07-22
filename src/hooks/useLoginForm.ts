import { LoginFormData } from '@/types/auth.types';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

/**
 * 로그인 폼 관리 커스텀 훅 (React Hook Form 버전)
 * 폼 상태, 검증, 입력 처리를 담당
 */
export const useLoginForm = () => {
  // React Hook Form 설정
  const form = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberLogin: false,
    },
    mode: 'onSubmit', // 제출 시 검증
    reValidateMode: 'onBlur', // 입력 시 검증
  });

  // 비밀번호 표시/숨김 상태
  const [showPassword, setShowPassword] = useState(false);

  /**
   * 비밀번호 표시/숨김 토글
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  /**
   * 폼 초기화
   */
  const resetForm = useCallback(() => {
    form.reset();
    setShowPassword(false);
  }, [form]);

  /**
   * 이메일 검증 규칙
   */
  const emailValidation = {
    required: '이메일을 입력해주세요.',
    pattern: {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '올바른 이메일 형식을 입력해주세요.',
    },
  };

  /**
   * 비밀번호 검증 규칙
   */
  const passwordValidation = {
    required: '비밀번호를 입력해주세요.',
    minLength: {
      value: 4,
      message: '비밀번호는 최소 4글자 이상 입력해주세요.',
    },
  };

  return {
    // React Hook Form 인스턴스
    form,

    // 상태값들
    showPassword,

    // 검증 규칙들
    emailValidation,
    passwordValidation,

    // 액션 함수들
    togglePasswordVisibility,
    resetForm,
  };
};
