// src/store/purchaseStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DirectPurchaseItem, OrderPageData, PurchaseType } from '@/types/order.types';

/**
 * 구매 프로세스 상태 관리 스토어
 * - 직접 구매와 장바구니 구매 모두 지원
 * - 결제 페이지로 데이터 전달 관리
 * - 주문 진행 상태 추적
 */
interface PurchaseStore {
  // 현재 구매 진행 데이터
  currentPurchase: OrderPageData | null;

  // 직접 구매 설정
  setDirectPurchase: (item: DirectPurchaseItem) => void;

  // 장바구니 구매 설정
  setCartPurchase: (items: DirectPurchaseItem[]) => void;

  // 배송 정보 업데이트
  updateShippingAddress: (address: OrderPageData['address']) => void;

  // 배송 메모 업데이트
  updateDeliveryMemo: (memo: string) => void;

  // 총 금액 계산
  calculateTotalAmount: () => number;

  // 구매 데이터 초기화
  clearPurchase: () => void;

  // 구매 데이터 존재 여부 확인
  hasPurchaseData: () => boolean;

  // 구매 타입 확인
  getPurchaseType: () => PurchaseType | null;
}

/**
 * 기본 배송비 계산 함수
 * @param totalAmount 총 상품 금액
 * @returns 배송비
 */
const calculateShippingFee = (totalAmount: number): number => {
  // 50,000원 이상 무료배송, 그 외 3,000원
  return totalAmount >= 50000 ? 0 : 3000;
};

export const usePurchaseStore = create<PurchaseStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      currentPurchase: null,

      // 직접 구매 설정
      setDirectPurchase: (item: DirectPurchaseItem) => {
        const totalAmount = item.price * item.quantity;
        const shippingFee = calculateShippingFee(totalAmount);

        set({
          currentPurchase: {
            type: 'direct',
            items: [item],
            totalAmount,
            shippingFee,
          },
        });

        console.log('[PurchaseStore] 직접 구매 설정:', {
          상품: item.productName,
          수량: item.quantity,
          총금액: totalAmount,
          배송비: shippingFee,
        });
      },

      // 장바구니 구매 설정
      setCartPurchase: (items: DirectPurchaseItem[]) => {
        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shippingFee = calculateShippingFee(totalAmount);

        set({
          currentPurchase: {
            type: 'cart',
            items,
            totalAmount,
            shippingFee,
          },
        });

        console.log('[PurchaseStore] 장바구니 구매 설정:', {
          상품수: items.length,
          총금액: totalAmount,
          배송비: shippingFee,
        });
      },

      // 배송 정보 업데이트
      updateShippingAddress: (address) => {
        const current = get().currentPurchase;
        if (!current) return;

        set({
          currentPurchase: {
            ...current,
            address,
          },
        });

        console.log('[PurchaseStore] 배송 정보 업데이트:', address);
      },

      // 배송 메모 업데이트
      updateDeliveryMemo: (memo) => {
        const current = get().currentPurchase;
        if (!current) return;

        set({
          currentPurchase: {
            ...current,
            memo,
          },
        });

        console.log('[PurchaseStore] 배송 메모 업데이트:', memo);
      },

      // 총 금액 계산 (상품 금액 + 배송비)
      calculateTotalAmount: () => {
        const current = get().currentPurchase;
        if (!current) return 0;

        return current.totalAmount + current.shippingFee;
      },

      // 구매 데이터 초기화
      clearPurchase: () => {
        set({ currentPurchase: null });
        console.log('[PurchaseStore] 구매 데이터 초기화');
      },

      // 구매 데이터 존재 여부 확인
      hasPurchaseData: () => {
        return !!get().currentPurchase;
      },

      // 구매 타입 확인
      getPurchaseType: () => {
        return get().currentPurchase?.type || null;
      },
    }),
    {
      name: 'purchase-storage', // localStorage 키 이름
      partialize: (state) => ({
        currentPurchase: state.currentPurchase, // currentPurchase만 저장
      }),
    },
  ),
);

/**
 * 사용 예시:
 *
 * // 직접 구매 설정
 * const { setDirectPurchase } = usePurchaseStore();
 * setDirectPurchase({
 *   productId: 123,
 *   productName: '몬스테라',
 *   productImage: '/images/monstera.jpg',
 *   price: 25000,
 *   quantity: 2,
 *   selectedColor: { colorIndex: 0, colorName: '흑색' }
 * });
 *
 * // 장바구니 구매 설정
 * const { setCartPurchase } = usePurchaseStore();
 * setCartPurchase(cartItems);
 *
 * // 배송 정보 업데이트
 * const { updateShippingAddress } = usePurchaseStore();
 * updateShippingAddress({
 *   name: '홍길동',
 *   phone: '010-1234-5678',
 *   address: '서울시 강남구 테헤란로 123',
 *   detailAddress: '4층 401호',
 *   zipCode: '06234'
 * });
 */
