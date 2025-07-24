// src/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 장바구니 아이템 타입 정의
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedColor?: {
    colorIndex: number;
    colorName: string;
  };
}

// 장바구니 스토어 인터페이스
interface CartStore {
  items: CartItem[];

  // 읽기 함수들
  getItems: () => CartItem[];
  getItemCount: () => number;
  getTotalPrice: () => number;
  getItemById: (productId: string) => CartItem | undefined;

  // 쓰기 함수들
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // 서버 동기화 함수들
  syncWithServer: (serverItems: CartItem[]) => void;
}

/**
 * 장바구니 전역 상태 관리 스토어
 * - Zustand로 상태 관리
 * - persist 미들웨어로 localStorage에 자동 저장
 * - 서버와 로컬 상태 동기화 지원
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      items: [],

      // 장바구니 아이템 목록 반환
      getItems: () => {
        return get().items;
      },

      // 장바구니 아이템 총 개수 반환
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // 장바구니 총 가격 계산
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      // 특정 상품 조회
      getItemById: (productId: string) => {
        return get().items.find((item) => item.productId === productId);
      },

      // 장바구니에 아이템 추가
      addItem: (itemData) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex((item) => item.productId === itemData.productId && JSON.stringify(item.selectedColor) === JSON.stringify(itemData.selectedColor));

          if (existingItemIndex >= 0) {
            // 이미 있는 아이템이면 수량 증가
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += itemData.quantity;
            return { items: newItems };
          } else {
            // 새로운 아이템 추가
            const newItem: CartItem = {
              ...itemData,
              id: `${itemData.productId}-${Date.now()}`, // 고유 ID 생성
            };
            return { items: [...state.items, newItem] };
          }
        });
      },

      // 장바구니에서 아이템 제거
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      // 아이템 수량 업데이트
      updateItemQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
        }));
      },

      // 장바구니 비우기
      clearCart: () => {
        set({ items: [] });
      },

      // 서버 데이터와 동기화
      syncWithServer: (serverItems: CartItem[]) => {
        set({ items: serverItems });
      },
    }),
    {
      name: 'cart-storage', // localStorage 키 이름
      partialize: (state) => ({
        items: state.items, // items만 저장
      }),
    },
  ),
);

/**
 * 사용 예시:
 *
 * const {
 *   items,
 *   addItem,
 *   removeItem,
 *   getItemCount,
 *   getTotalPrice
 * } = useCartStore();
 *
 * // 아이템 추가
 * addItem({
 *   productId: '123',
 *   productName: '하트 호야',
 *   productImage: '/images/plant.jpg',
 *   price: 18000,
 *   quantity: 1,
 *   selectedColor: { colorIndex: 0, colorName: '흑색' }
 * });
 *
 * // 총 아이템 수
 * const count = getItemCount();
 *
 * // 총 가격
 * const total = getTotalPrice();
 */
