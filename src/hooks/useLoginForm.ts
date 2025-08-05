import { loginAction } from '@/lib/functions/authFunctions';
import useUserStore, { startTokenRefreshInterval } from '@/store/authStore';
import { ServerValidationError, ServerValidationErrors } from '@/types/api.types';
import type { LoginCredentials, LoginFormData, LoginFormErrors, LoginState } from '@/types/auth.types';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

/**
 * ServerValidationErrors를 LoginFormErrors로 변환
 */
const convertToLoginFormErrors = (serverErrors: ServerValidationErrors<LoginFormErrors> | undefined): LoginFormErrors | null => {
  if (!serverErrors) return null;

  const formErrors: LoginFormErrors = {};

  if (serverErrors.email) {
    formErrors.email = serverErrors.email.msg;
  }

  if (serverErrors.password) {
    formErrors.password = serverErrors.password.msg;
  }

  return Object.keys(formErrors).length > 0 ? formErrors : null;
};

/**
 * 완전히 통합된 로그인 폼 관리 커스텀 훅
 * 폼 상태, 검증, 로그인 처리, 사용자 상태 관리를 모두 담당
 */
export const useLoginForm = () => {
  const router = useRouter();
  const { setUser, setLoading } = useUserStore();

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

  // 로그인 상태 관리
  const [loginState, setLoginState] = useState<LoginState>({
    isLoading: false,
    error: null,
    fieldErrors: null,
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
    setLoginState({
      isLoading: false,
      error: null,
      fieldErrors: null,
    });
  }, [form]);

  /**
   * 로그인 에러 상태 초기화
   */
  const clearErrors = useCallback(() => {
    setLoginState((prev) => ({
      ...prev,
      error: null,
      fieldErrors: null,
    }));
  }, []);

  /**
   * 통합된 로그인 처리 함수
   */
  const handleLogin = useCallback(
    async (formData: LoginFormData) => {
      // 로딩 상태 시작
      setLoginState({
        isLoading: true,
        error: null,
        fieldErrors: null,
      });
      setLoading(true);

      try {
        // 로그인 자격 증명 준비
        const credentials: LoginCredentials = {
          email: formData.email.trim(),
          password: formData.password,
          rememberLogin: formData.rememberLogin,
        };

        // 로그인 액션 호출
        const loginResult = await loginAction(credentials);

        if (loginResult.ok === 1) {
          // 로그인 성공
          const { user } = loginResult.item;

          // 사용자 상태 저장
          setUser(user);

          // 토큰 자동 갱신 시작
          startTokenRefreshInterval();

          // 로딩 상태 종료
          setLoginState({
            isLoading: false,
            error: null,
            fieldErrors: null,
          });
          setLoading(false);

          // 성공 시 리디렉션
          const redirectUrl = new URLSearchParams(window.location.search).get('redirect');
          router.push(redirectUrl || '/');

          return true;
        } else {
          // 로그인 실패
          setLoginState({
            isLoading: false,
            error: loginResult.message,
            fieldErrors: convertToLoginFormErrors(loginResult.errors),
          });
          setLoading(false);

          // 폼 필드 에러 설정 (React Hook Form)
          if (loginResult.errors) {
            Object.entries(loginResult.errors).forEach(([field, error]) => {
              if (isServerValidationError(error) && (field === 'email' || field === 'password')) {
                form.setError(field, {
                  type: 'server',
                  message: error.msg,
                });
              }
            });
          }

          console.error('[로그인 폼] 로그인 실패:', loginResult.message);
          return false;
        }
      } catch (error) {
        // 예상하지 못한 에러
        const errorMessage = '로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

        setLoginState({
          isLoading: false,
          error: errorMessage,
          fieldErrors: null,
        });
        setLoading(false);

        console.error('[로그인 폼] 예상하지 못한 오류:', error);
        return false;
      }
    },
    [form, setUser, setLoading, router],
  );

  /**
   * 폼 제출 핸들러
   */
  const onSubmit = form.handleSubmit(handleLogin);

  /**
   * 이메일 검증 규칙
   */
  const emailValidation = {
    required: '이메일을 입력해주세요.',
    pattern: {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '올바른 이메일 형식을 입력해주세요.',
    },
    onChange: clearErrors, // 입력 시 에러 초기화
  };

  /**
   * 비밀번호 검증 규칙
   */
  const passwordValidation = {
    required: '비밀번호를 입력해주세요.',
    minLength: {
      value: 4,
      message: '비밀번호는 최소 4자 이상이어야 합니다.',
    },
    pattern: {
      value: /^(?=.*[a-zA-Z])(?=.*\d)/,
      message: '비밀번호는 영문과 숫자를 모두 포함해야 합니다.',
    },
    onChange: clearErrors, // 입력 시 에러 초기화
  };

  return {
    // React Hook Form 인스턴스
    form,

    // 상태값들
    showPassword,
    isLoading: loginState.isLoading,
    error: loginState.error,
    fieldErrors: loginState.fieldErrors,

    // 검증 규칙들
    emailValidation,
    passwordValidation,

    // 액션 함수들
    togglePasswordVisibility,
    resetForm,
    clearErrors,
    handleLogin,
    onSubmit,
  };
};

// 타입 가드 함수
const isServerValidationError = (error: unknown): error is ServerValidationError => {
  return typeof error === 'object' && error !== null && 'msg' in error;
};
