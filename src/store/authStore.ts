import { logoutAction, refreshTokenAction } from '@/lib/actions/authActions';
import { isTokenExpired, isTokenExpiringSoon } from '@/lib/utils/auth.client';
import { NetworkError, RefreshTokenResult } from '@/types/auth.types';
import { User, UserState } from '@/types/user.types';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

// 쿠키 기반 스토리지 구현 (서버 액션과 일관성 유지)
const cookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;

    // 개선된 쿠키 파싱 로직: = 기호가 포함된 값 처리
    const cookies = document.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {
      const [key, ...valueParts] = cookie.split('=').map((c) => c.trim());
      if (key && valueParts.length > 0) {
        const value = valueParts.join('='); // JWT 토큰처럼 = 패딩이 있는 경우 대응
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {});

    return cookies[name] || null;
  },
  setItem: (): void => {
    // zustand persist에서 쿠키 설정하지 않음 (서버 액션에서만 설정)
    // 클라이언트에서는 읽기 전용
    console.warn(`[쿠키 스토리지] 클라이언트에서 쿠키 설정 시도 무시`);
  },
  removeItem: (name: string): void => {
    // zustand persist에서 쿠키 삭제하지 않음 (서버 액션에서만 삭제)
    console.warn(`[쿠키 스토리지] 클라이언트에서 쿠키 삭제 시도 무시: ${name}`);
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

          console.log('[로그아웃] 성공');
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
      onRehydrateStorage: () => (state) => {
        console.log('[쿠키 스토리지] 사용자 상태 복원:', state?.user?.email || '없음');
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
    console.log('[토큰 갱신] 액세스 토큰이 아직 유효합니다.');
    return true;
  }

  // 중복 갱신 방지 (1분 이내 갱신한 경우)
  const oneMinuteAgo = Date.now() - 60 * 1000;
  if (lastTokenRefresh && lastTokenRefresh > oneMinuteAgo) {
    console.log('[토큰 갱신] 최근에 갱신했으므로 건너뜁니다.');
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

      console.log('[토큰 갱신] 성공');
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
    console.error('[토큰 갱신] 오류:', error);

    // 네트워크 오류 처리
    const networkError = error as NetworkError;

    if (networkError?.status === 401 || networkError?.status === 403) {
      // 인증 오류인 경우 로그아웃 처리
      console.log('[토큰 갱신] 인증 오류로 인한 로그아웃 처리');
      useUserStore.setState({
        user: null,
        isLoading: false,
        lastTokenRefresh: null,
      });
    } else {
      // 네트워크 오류인 경우 상태 유지, 로딩만 해제
      console.log('[토큰 갱신] 네트워크 오류로 상태 유지');
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

  console.log('[자동 토큰 갱신] 인터벌 시작');

  // 5분마다 토큰 상태 확인
  tokenCheckInterval = setInterval(
    () => {
      const { user, refreshUserToken } = useUserStore.getState();

      if (user?.token?.accessToken) {
        // 토큰이 만료되었거나 곧 만료될 예정이면 갱신
        if (isTokenExpired(user.token.accessToken) || isTokenExpiringSoon(user.token.accessToken)) {
          console.log('[자동 토큰 갱신] 토큰 갱신 시작');
          refreshUserToken().catch((error) => {
            console.error('[자동 토큰 갱신] 오류:', error);
          });
        }
      }
    },
    5 * 60 * 1000,
  ); // 5분
};

export const stopTokenRefreshInterval = () => {
  if (tokenCheckInterval) {
    console.log('[자동 토큰 갱신] 인터벌 정지');
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
