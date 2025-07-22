import { AuthService } from '@/lib/api/authService';
import { useAuth } from '@/store/authStore';
import { LoginFormData } from '@/types/auth.types';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

/**
 * 로그인 비즈니스 로직 관리 커스텀 훅
 * API 호출, 상태 관리, 라우팅을 담당
 */
export const useLogin = () => {
  const router = useRouter();
  const { login: loginToStore, setLoading, isLoading } = useAuth();

  // 에러 상태 관리
  const [error, setError] = useState<string>('');

  /**
   * 로그인 실행 (React Hook Form 데이터와 호환)
   * @param formData - 로그인 폼 데이터
   * @returns 로그인 성공 여부
   */
  const login = useCallback(
    async (formData: LoginFormData): Promise<boolean> => {
      try {
        // 로딩 상태 시작 (authStore에서만 관리)
        setLoading(true);
        setError('');

        // API 호출 (필요한 필드만 추출)
        const response = await AuthService.login({
          email: formData.email,
          password: formData.password,
        });

        // 스토어에 로그인 정보 저장
        loginToStore({
          user: response.user,
          token: response.token,
        });

        // 메인 페이지로 이동
        router.push('/');

        return true;
      } catch (error) {
        console.error('[로그인] 오류:', error);
        const errorMessage = error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.';

        setError(errorMessage);
        return false;
      } finally {
        // 로딩 상태 종료 (authStore에서만 관리)
        setLoading(false);
      }
    },
    [loginToStore, router, setLoading],
  );

  /**
   * 에러 메시지 초기화
   */
  const clearError = useCallback(() => {
    setError('');
  }, []);

  /**
   * 로그인 재시도
   * @param formData - 로그인 폼 데이터
   */
  const retry = useCallback(
    async (formData: LoginFormData) => {
      clearError();
      return await login(formData);
    },
    [login, clearError],
  );

  return {
    // 상태값들 (isLoading은 authStore에서 가져옴)
    isLoading,
    error,

    // 액션 함수들
    login,
    clearError,
    retry,
  };
};
