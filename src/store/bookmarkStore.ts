// src/store/bookmarkStore.ts

/**
 * 북마크 전역 상태 관리 스토어
 * @description 상품, 게시글, 사용자 등 다양한 타입의 북마크를 관리
 * @module bookmarkStore
 */

import { BookmarkType } from '@/types/bookmark.types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 북마크 상태 타입 정의
 */
interface BookmarkState {
  // 타입별 북마크 상태 (key: targetId, value: bookmarkId)
  productBookmarks: Record<number, number | undefined>;
  postBookmarks: Record<number, number | undefined>;
  userBookmarks: Record<number, number | undefined>;

  // 북마크 상태 조회
  isBookmarked: (targetId: number, type: BookmarkType) => boolean;
  getBookmarkId: (targetId: number, type: BookmarkType) => number | undefined;

  // 북마크 상태 업데이트
  setBookmark: (targetId: number, bookmarkId: number | undefined, type: BookmarkType) => void;

  // 북마크 토글 (낙관적 업데이트용)
  toggleBookmark: (targetId: number, type: BookmarkType, currentBookmarkId?: number) => void;

  // 타입별 북마크 초기화
  clearBookmarksByType: (type: BookmarkType) => void;

  // 전체 북마크 초기화
  clearAllBookmarks: () => void;
}

/**
 * 북마크 전역 상태 관리 스토어
 * @example
 * // 상품 북마크 확인
 * const isProductBookmarked = useBookmarkStore(state => state.isBookmarked(123, 'product'));
 *
 * // 게시글 북마크 토글
 * const toggleBookmark = useBookmarkStore(state => state.toggleBookmark);
 * toggleBookmark(456, 'post');
 *
 * // 북마크 ID 가져오기
 * const bookmarkId = useBookmarkStore(state => state.getBookmarkId(123, 'product'));
 */
export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      productBookmarks: {},
      postBookmarks: {},
      userBookmarks: {},

      /**
       * 북마크 여부 확인
       * @param {number} targetId - 대상 ID
       * @param {BookmarkType} type - 북마크 타입
       * @returns {boolean} 북마크 여부
       */
      isBookmarked: (targetId: number, type: BookmarkType) => {
        const bookmarks = get()[`${type}Bookmarks` as keyof BookmarkState] as Record<number, number | undefined>;
        return !!bookmarks[targetId];
      },

      /**
       * 북마크 ID 조회
       * @param {number} targetId - 대상 ID
       * @param {BookmarkType} type - 북마크 타입
       * @returns {number | undefined} 북마크 ID
       */
      getBookmarkId: (targetId: number, type: BookmarkType) => {
        const bookmarks = get()[`${type}Bookmarks` as keyof BookmarkState] as Record<number, number | undefined>;
        return bookmarks[targetId];
      },

      /**
       * 개별 북마크 상태 설정
       * @param {number} targetId - 대상 ID
       * @param {number | undefined} bookmarkId - 북마크 ID
       * @param {BookmarkType} type - 북마크 타입
       */
      setBookmark: (targetId: number, bookmarkId: number | undefined, type: BookmarkType) => {
        set((state) => ({
          [`${type}Bookmarks`]: {
            ...(state[`${type}Bookmarks` as keyof BookmarkState] as Record<number, number | undefined>),
            [targetId]: bookmarkId,
          },
        }));
      },

      /**
       * 북마크 토글 (낙관적 업데이트용)
       * @param {number} targetId - 대상 ID
       * @param {BookmarkType} type - 북마크 타입
       * @param {number} currentBookmarkId - 현재 북마크 ID (추가 시 사용)
       */
      toggleBookmark: (targetId: number, type: BookmarkType, currentBookmarkId?: number) => {
        set((state) => {
          const bookmarksKey = `${type}Bookmarks` as keyof BookmarkState;
          const bookmarks = state[bookmarksKey] as Record<number, number | undefined>;
          const isCurrentlyBookmarked = !!bookmarks[targetId];

          return {
            [bookmarksKey]: {
              ...bookmarks,
              [targetId]: isCurrentlyBookmarked ? undefined : currentBookmarkId || -1, // -1은 임시 ID
            },
          };
        });
      },

      /**
       * 특정 타입의 북마크 초기화
       * @param {BookmarkType} type - 북마크 타입
       */
      clearBookmarksByType: (type: BookmarkType) => {
        set({
          [`${type}Bookmarks`]: {},
        });
      },

      /**
       * 전체 북마크 초기화 (로그아웃 시)
       */
      clearAllBookmarks: () => {
        set({
          productBookmarks: {},
          postBookmarks: {},
          userBookmarks: {},
        });
      },
    }),
    {
      name: 'bookmark-storage',
    },
  ),
);

// 로그아웃 이벤트 리스너 설정
if (typeof window !== 'undefined') {
  // storage 이벤트 감지 (다른 탭에서의 로그아웃 포함)
  window.addEventListener('storage', (e) => {
    if (e.key === 'user-auth' && !e.newValue) {
      // user-auth 쿠키가 삭제되면 북마크도 초기화
      useBookmarkStore.getState().clearAllBookmarks();
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
      useBookmarkStore.getState().clearAllBookmarks();
    }
  };

  // 주기적으로 인증 쿠키 확인 (현재 탭에서의 로그아웃 감지)
  setInterval(checkAuthCookie, 1000);
}

/**
 * 북마크 스토어 헬퍼 함수들
 */

/**
 * 상품 북마크 관련 헬퍼
 */
export const productBookmarkHelpers = {
  isBookmarked: (productId: number) => useBookmarkStore.getState().isBookmarked(productId, 'product'),
  getBookmarkId: (productId: number) => useBookmarkStore.getState().getBookmarkId(productId, 'product'),
  setBookmark: (productId: number, bookmarkId?: number) => useBookmarkStore.getState().setBookmark(productId, bookmarkId, 'product'),
  toggle: (productId: number, bookmarkId?: number) => useBookmarkStore.getState().toggleBookmark(productId, 'product', bookmarkId),
};

/**
 * 게시글 북마크 관련 헬퍼
 */
export const postBookmarkHelpers = {
  isBookmarked: (postId: number) => useBookmarkStore.getState().isBookmarked(postId, 'post'),
  getBookmarkId: (postId: number) => useBookmarkStore.getState().getBookmarkId(postId, 'post'),
  setBookmark: (postId: number, bookmarkId?: number) => useBookmarkStore.getState().setBookmark(postId, bookmarkId, 'post'),
  toggle: (postId: number, bookmarkId?: number) => useBookmarkStore.getState().toggleBookmark(postId, 'post', bookmarkId),
};
