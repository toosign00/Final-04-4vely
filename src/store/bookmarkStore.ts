// src/store/bookmarkStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BookmarkStore {
  bookmarks: Set<string>; // 북마크된 상품 ID들
  isBookmarked: (productId: string) => boolean;
  toggleBookmark: (productId: string) => void;
  addBookmark: (productId: string) => void;
  removeBookmark: (productId: string) => void;
  clearBookmarks: () => void;
  getBookmarkCount: () => number;
  getBookmarkedIds: () => string[];
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: new Set<string>(),

      isBookmarked: (productId: string) => {
        return get().bookmarks.has(productId);
      },

      toggleBookmark: (productId: string) => {
        set((state) => {
          const newBookmarks = new Set(state.bookmarks);
          if (newBookmarks.has(productId)) {
            newBookmarks.delete(productId);
          } else {
            newBookmarks.add(productId);
          }
          return { bookmarks: newBookmarks };
        });
      },

      addBookmark: (productId: string) => {
        set((state) => {
          const newBookmarks = new Set(state.bookmarks);
          newBookmarks.add(productId);
          return { bookmarks: newBookmarks };
        });
      },

      removeBookmark: (productId: string) => {
        set((state) => {
          const newBookmarks = new Set(state.bookmarks);
          newBookmarks.delete(productId);
          return { bookmarks: newBookmarks };
        });
      },

      clearBookmarks: () => {
        set({ bookmarks: new Set<string>() });
      },

      getBookmarkCount: () => {
        return get().bookmarks.size;
      },

      getBookmarkedIds: () => {
        return Array.from(get().bookmarks);
      },
    }),
    {
      name: 'bookmark-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              bookmarks: new Set(state.bookmarks || []),
            },
          };
        },
        setItem: (name, value) => {
          const str = JSON.stringify({
            state: {
              ...value.state,
              bookmarks: Array.from(value.state.bookmarks || []),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
);
