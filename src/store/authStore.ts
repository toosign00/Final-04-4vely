import { AuthService } from '@/services/authService';
import { UserInfo } from '@/types/auth.types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 인증 상태 타입 정의
interface AuthState {
  // 상태 값들
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;

  // 액션 함수들
  login: (userData: { user: UserInfo; token: string }) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  checkAuthStatus: () => Promise<boolean>;
  updateUser: (userData: Partial<UserInfo>) => void;
}

// 인증 상태 관리 스토어 생성
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,

      // 로그인 처리 함수
      login: (userData) => {
        set({
          isAuthenticated: true,
          user: userData.user,
          token: userData.token,
          isLoading: false,
        });
      },

      // 로그아웃 처리 함수
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        });
      },

      // 로딩 상태 설정 함수
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // 인증 상태 확인 함수
      checkAuthStatus: async () => {
        const { token } = get();

        if (!token) {
          return false;
        }

        try {
          // AuthService를 통한 토큰 검증
          const user = await AuthService.verifyToken(token);
          set({
            isAuthenticated: true,
            user,
          });
          return true;
        } catch (error) {
          console.error('[인증 상태 확인] 오류:', error);
          get().logout();
          return false;
        }
      },

      // 사용자 정보 업데이트 함수
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },
    }),
    {
      name: 'auth-storage', // 로컬 스토리지 키 이름
      partialize: (state) => ({
        // 지속 저장할 상태들 선택
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    },
  ),
);

// 훅 형태로 사용할 수 있는 헬퍼 함수들
export const useAuth = () => {
  const authStore = useAuthStore();

  return {
    // 상태 값들
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    isLoading: authStore.isLoading,

    // 액션 함수들
    login: authStore.login,
    logout: authStore.logout,
    setLoading: authStore.setLoading,
    checkAuthStatus: authStore.checkAuthStatus,
    updateUser: authStore.updateUser,
  };
};
