import { logoutAction, refreshTokenAction } from '@/lib/functions/authFunctions';
import { isTokenExpired, isTokenExpiringSoon } from '@/lib/utils/auth.client';
import { NetworkError, RefreshTokenResult } from '@/types/auth.types';
import { User, UserState } from '@/types/user.types';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

// 쿠키 기반 스토리지 구현 (서버 액션과 일관성 유지)
const cookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;

    // 쿠키 파싱
    const cookies = document.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {
      const [key, ...valueParts] = cookie.split('=').map((c) => c.trim());
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {});

    return cookies[name] || null;
  },
  setItem: (): void => {
    // zustand persist에서 쿠키 설정하지 않음 (서버 액션에서만 설정)
    // 클라이언트에서는 읽기 전용
  },
  removeItem: (): void => {
    // zustand persist에서 쿠키 삭제하지 않음 (서버 액션에서만 삭제)
  },
};

// 확장된 UserState 타입
interface ExtendedUserState extends UserState {
  isLoading: boolean;
  lastTokenRefresh: number | null;
  setLoading: (loading: boolean) => void;
  refreshUserToken: () => Promise<boolean>;
  logout: () => Promise<void>;
}

// 동시성 처리를 위한 Promise 캐시
let refreshPromise: Promise<boolean> | null = null;

// zustand 스토어를 생성하고, persist 미들웨어로 쿠키를 읽음
const useUserStore = create(
  persist<ExtendedUserState>(
    (set) => ({
      user: null, // 로그인 된 사용자 정보 상태 (초기값: null)
      isLoading: false, // 로딩 상태
      lastTokenRefresh: null, // 마지막 토큰 갱신 시간

      setUser: (user: User) => {
        set({
          user,
          lastTokenRefresh: Date.now(), // 사용자 설정 시 갱신 시간 업데이트
        });
      },

      resetUser: () => {
        set({
          user: null,
          isLoading: false,
          lastTokenRefresh: null,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      /**
       * 토큰 자동 갱신 함수 (서버 액션 사용)
       * 동시성 처리 및 개선된 토큰 검증 로직 적용
       */
      refreshUserToken: async (): Promise<boolean> => {
        // 이미 진행 중인 토큰 갱신이 있으면 해당 Promise 반환
        if (refreshPromise) {
          return refreshPromise;
        }

        // 실제 토큰 갱신 로직을 별도 함수로 분리
        refreshPromise = performTokenRefresh();
        const result = await refreshPromise;
        refreshPromise = null;

        return result;
      },

      /**
       * 로그아웃 함수 (서버 액션 사용)
       */
      logout: async (): Promise<void> => {
        set({ isLoading: true });

        try {
          // 서버 액션을 통해 로그아웃 처리 (token 없이 호출하면 쿠키에서 가져옴)
          await logoutAction();
        } catch (error) {
          console.error('[로그아웃] 오류:', error);
        } finally {
          // 로컬 상태도 초기화
          set({
            user: null,
            isLoading: false,
            lastTokenRefresh: null,
          });
        }
      },
    }),
    {
      name: 'user-auth', // 쿠키 이름 (서버 액션과 동일)
      storage: createJSONStorage(() => cookieStorage), // 쿠키 읽기 전용
      // 서버에서 설정한 쿠키를 클라이언트에서 읽어와 상태 복원
      onRehydrateStorage: () => () => {
        // 상태 복원 완료
      },
    },
  ),
);

/**
 * 실제 토큰 갱신을 수행하는 내부 함수
 * 토큰 검증 및 에러 처리 로직 적용
 */
const performTokenRefresh = async (): Promise<boolean> => {
  const { user, lastTokenRefresh } = useUserStore.getState();

  if (!user?.token?.refreshToken) {
    console.warn('[토큰 갱신] 리프레시 토큰이 없습니다.');
    return false;
  }

  // 토큰 검증: 액세스 토큰이 아직 유효하면 갱신하지 않음
  if (user.token.accessToken && !isTokenExpired(user.token.accessToken) && !isTokenExpiringSoon(user.token.accessToken)) {
    return true;
  }

  // 중복 갱신 방지 (1분 이내 갱신한 경우)
  const oneMinuteAgo = Date.now() - 60 * 1000;
  if (lastTokenRefresh && lastTokenRefresh > oneMinuteAgo) {
    return true;
  }

  useUserStore.setState({ isLoading: true });

  try {
    // 서버 액션을 통해 토큰 갱신 처리 (refreshToken 없이 호출하면 쿠키에서 가져옴)
    const refreshResult = (await refreshTokenAction()) as RefreshTokenResult;

    if (refreshResult.ok === 1) {
      // 새로운 액세스 토큰으로 사용자 정보 업데이트
      const updatedUser: User = {
        ...user,
        token: {
          ...user.token,
          accessToken: refreshResult.item.accessToken,
        },
      };

      useUserStore.setState({
        user: updatedUser,
        isLoading: false,
        lastTokenRefresh: Date.now(),
      });

      return true;
    } else {
      console.error('[토큰 갱신] 실패:', refreshResult.message);

      // 리프레시 토큰도 만료된 경우 로그아웃 처리
      useUserStore.setState({
        user: null,
        isLoading: false,
        lastTokenRefresh: null,
      });

      return false;
    }
  } catch (error) {
    // 네트워크 오류 처리
    const networkError = error as NetworkError;

    if (networkError?.status === 401 || networkError?.status === 403) {
      // 인증 오류인 경우 로그아웃 처리
      useUserStore.setState({
        user: null,
        isLoading: false,
        lastTokenRefresh: null,
      });
    } else {
      // 네트워크 오류인 경우 상태 유지, 로딩만 해제
      useUserStore.setState({ isLoading: false });
    }

    return false;
  }
};

/**
 * 토큰 자동 갱신 미들웨어 (토큰이 곧 만료될 때 자동 갱신)
 * 메모리 누수 방지를 위한 인터벌 관리
 */
let tokenCheckInterval: NodeJS.Timeout | null = null;

export const startTokenRefreshInterval = () => {
  // 기존 인터벌 정리 (메모리 누수 방지)
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
    tokenCheckInterval = null;
  }

  // 5분마다 토큰 상태 확인
  tokenCheckInterval = setInterval(
    () => {
      const { user, refreshUserToken } = useUserStore.getState();

      if (user?.token?.accessToken) {
        // 토큰이 만료되었거나 곧 만료될 예정이면 갱신
        if (isTokenExpired(user.token.accessToken) || isTokenExpiringSoon(user.token.accessToken)) {
          refreshUserToken().catch(() => {
            // 토큰 갱신 실패 시 무시
          });
        }
      }
    },
    5 * 60 * 1000,
  ); // 5분
};

export const stopTokenRefreshInterval = () => {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
    tokenCheckInterval = null;
  }
};

// 페이지 언로드 시 인터벌 정리 (메모리 누수 방지)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    stopTokenRefreshInterval();
  });
}

export default useUserStore;

/**
 * 통합 인증 훅
 * NextAuth 세션과 Zustand user 상태를 통합하여 관리
 * OAuth와 일반 로그인을 모두 지원하는 통합 인증 상태 제공
 */
export function useAuth() {
  const { user: zustandUser, logout: zustandLogout, ...rest } = useUserStore();
  const { data: session, status } = useSession();

  // NextAuth 세션 또는 Zustand user 중 하나라도 있으면 로그인된 것으로 간주
  const isLoggedIn = useMemo(() => !!session?.user || !!zustandUser, [session?.user, zustandUser]);
  
  // 현재 사용자 정보 (OAuth 우선, 그 다음 Zustand)
  const currentUser = useMemo(() => session?.user || zustandUser, [session?.user, zustandUser]);

  // 로딩 상태 (NextAuth 로딩 중이거나 Zustand 로딩 중)
  const isLoading = useMemo(() => status === 'loading' || rest.isLoading, [status, rest.isLoading]);

  return {
    // 통합 인증 상태
    isLoggedIn,
    currentUser,
    isLoading, // 통합된 로딩 상태
    
    // 개별 상태 (필요시 접근)
    zustandUser,
    session: session?.user,
    sessionStatus: status,
    
    // Zustand 메서드들 (isLoading 제외)
    setUser: rest.setUser,
    resetUser: rest.resetUser,
    setLoading: rest.setLoading,
    refreshUserToken: rest.refreshUserToken,
    lastTokenRefresh: rest.lastTokenRefresh,
    zustandLogout,
  };
}
