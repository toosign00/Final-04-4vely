// src/store/bookmarkStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 북마크 스토어 인터페이스 정의
interface BookmarkStore {
  bookmarks: Set<string>; // 북마크된 상품 ID들을 Set으로 관리 (중복 방지, 빠른 검색)
  isBookmarked: (productId: string) => boolean;
  toggleBookmark: (productId: string) => void;
  addBookmark: (productId: string) => void;
  removeBookmark: (productId: string) => void;
  clearBookmarks: () => void;
  getBookmarkCount: () => number;
  getBookmarkedIds: () => string[];
}

/**
 * 북마크 전역 상태 관리 스토어
 * - Zustand로 상태 관리
 * - persist 미들웨어로 localStorage에 자동 저장
 * - Set 자료구조로 빠른 검색과 중복 방지
 */
export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      // 초기 상태: 빈 Set
      bookmarks: new Set<string>(),

      // 특정 상품이 북마크되어 있는지 확인
      isBookmarked: (productId: string) => {
        return get().bookmarks.has(productId);
      },

      // 북마크 토글 (있으면 제거, 없으면 추가)
      toggleBookmark: (productId: string) => {
        set((state) => {
          const newBookmarks = new Set(state.bookmarks); // 새로운 Set 생성
          if (newBookmarks.has(productId)) {
            newBookmarks.delete(productId);
          } else {
            newBookmarks.add(productId);
          }
          return { bookmarks: newBookmarks };
        });
      },

      // 북마크 추가
      addBookmark: (productId: string) => {
        set((state) => {
          const newBookmarks = new Set(state.bookmarks);
          newBookmarks.add(productId); // Set이므로 중복 자동 방지
          return { bookmarks: newBookmarks };
        });
      },

      // 북마크 제거
      removeBookmark: (productId: string) => {
        set((state) => {
          const newBookmarks = new Set(state.bookmarks);
          newBookmarks.delete(productId);
          return { bookmarks: newBookmarks };
        });
      },

      // 모든 북마크 제거 (안 쓰게 되면 제거)
      clearBookmarks: () => {
        set({ bookmarks: new Set<string>() });
      },

      // 북마크 개수 반환
      getBookmarkCount: () => {
        return get().bookmarks.size; // Set.size 속성 사용
      },

      // 북마크된 ID 배열로 반환 (컴포넌트에서 map 등 사용 시)
      getBookmarkedIds: () => {
        return Array.from(get().bookmarks); // Set을 배열로 변환
      },
    }),
    {
      name: 'bookmark-storage', // localStorage 키 이름

      // Set을 localStorage에 저장하기 위한 커스텀 storage 설정
      storage: {
        // localStorage에서 데이터 읽기
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;

          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              // 배열로 저장된 데이터를 다시 Set으로 변환
              bookmarks: new Set(state.bookmarks || []),
            },
          };
        },

        // localStorage에 데이터 저장
        setItem: (name, value) => {
          const str = JSON.stringify({
            state: {
              ...value.state,
              // Set을 배열로 변환하여 JSON 직렬화 가능하게 만듦
              bookmarks: Array.from(value.state.bookmarks || []),
            },
          });
          localStorage.setItem(name, str);
        },

        // localStorage에서 데이터 제거
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
);

/**
 * 사용 예시:
 *
 * const { isBookmarked, toggleBookmark, getBookmarkCount } = useBookmarkStore();
 *
 * // 북마크 여부 확인
 * const bookmarked = isBookmarked('product-123');
 *
 * // 북마크 토글
 * toggleBookmark('product-123');
 *
 * // 총 북마크 수
 * const count = getBookmarkCount();
 */
