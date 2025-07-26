// src/store/bookmarkStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 북마크 상태 타입 정의
interface BookmarkState {
  // 상품별 북마크 상태 (key: productId, value: bookmarkId)
  productBookmarks: Record<number, number | undefined>;

  // 북마크 상태 조회
  isBookmarked: (productId: number) => boolean;
  getBookmarkId: (productId: number) => number | undefined;

  // 북마크 상태 업데이트
  setBookmark: (productId: number, bookmarkId: number | undefined) => void;

  // 북마크 토글 (낙관적 업데이트용)
  toggleBookmark: (productId: number, currentBookmarkId?: number) => void;

  // 전체 북마크 초기화
  clearBookmarks: () => void;
}

/**
 * 북마크 전역 상태 관리 스토어
 * - 페이지 이동 후에도 북마크 상태 유지
 * - 여러 컴포넌트에서 북마크 상태 공유
 * - 각 BookmarkButton이 자체적으로 상태 관리
 */
export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      productBookmarks: {},

      // 북마크 여부 확인
      isBookmarked: (productId: number) => {
        return !!get().productBookmarks[productId];
      },

      // 북마크 ID 조회
      getBookmarkId: (productId: number) => {
        return get().productBookmarks[productId];
      },

      // 개별 북마크 상태 설정
      setBookmark: (productId: number, bookmarkId: number | undefined) => {
        set((state) => ({
          productBookmarks: {
            ...state.productBookmarks,
            [productId]: bookmarkId,
          },
        }));
      },

      // 북마크 토글 (낙관적 업데이트용)
      toggleBookmark: (productId: number, currentBookmarkId?: number) => {
        set((state) => {
          const isCurrentlyBookmarked = !!state.productBookmarks[productId];

          return {
            productBookmarks: {
              ...state.productBookmarks,
              [productId]: isCurrentlyBookmarked ? undefined : currentBookmarkId || -1, // -1은 임시 ID
            },
          };
        });
      },

      // 전체 북마크 초기화 (로그아웃 시 사용)
      clearBookmarks: () => {
        set({ productBookmarks: {} });
      },
    }),
    {
      name: 'bookmark-storage', // localStorage 키 이름
    },
  ),
);

// 로그아웃 이벤트 리스너 설정
if (typeof window !== 'undefined') {
  // storage 이벤트 감지 (다른 탭에서의 로그아웃 포함)
  window.addEventListener('storage', (e) => {
    if (e.key === 'user-auth' && !e.newValue) {
      // user-auth 쿠키가 삭제되면 북마크도 초기화
      useBookmarkStore.getState().clearBookmarks();
    }
  });

  // 현재 탭에서의 쿠키 변화 감지
  const checkAuthCookie = () => {
    const cookies = document.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {
      const [key, value] = cookie.split('=').map((c) => c.trim());
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {});

    if (!cookies['user-auth']) {
      useBookmarkStore.getState().clearBookmarks();
    }
  };

  // 주기적으로 인증 쿠키 확인 (현재 탭에서의 로그아웃 감지)
  setInterval(checkAuthCookie, 1000);
}
