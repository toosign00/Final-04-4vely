// src/types/order.types.ts

import { ApiRes } from './api.types';
import { Product } from './product.types';

/**
 * ===========================
 * 주문/구매 관련 타입 정의
 * ===========================
 */

/** 주문 상품 정보 */
export interface OrderProduct {
  _id: number;
  product_id: number;
  quantity: number;
  price: number;
  color?: string; // 화분 색상 등 옵션 (새로운 필드)
  createdAt: string;
  updatedAt: string;
  product?: Product; // 상품 상세 정보 (populate된 경우)
}

/** 주문 기본 정보 */
export interface Order {
  _id: number;
  user_id: number;
  state: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  products: OrderProduct[];
  cost: {
    total: number; // 총 결제 금액
    products: number; // 상품 금액
    shippingFees: number; // 배송비
  };
  address?: {
    name: string; // 받는 사람
    phone: string; // 연락처
    address: string; // 주소
    detailAddress?: string; // 상세 주소
    zipCode?: string; // 우편번호
  };
  memo?: OrderMemo; // 배송 메모 (객체)
  createdAt: string;
  updatedAt: string;
}

/** 주문 메모 객체 타입 */
export interface OrderMemo {
  selectedMemo: string; // 배송 메모
  selectedImage?: string | string[]; // 선택한 옵션의 이미지 파일(들)
}

/** 주문 생성 요청 타입 */
export interface CreateOrderRequest {
  products: Array<{
    _id: number;
    quantity: number;
    color?: string; // color 필드로 변경
  }>;
  address?: {
    name: string;
    value: string; // 전체 주소를 하나의 문자열로
    phone: string;
  };
  memo?: OrderMemo; // 전체 주문 메모 (객체 형태)
}

/** 직접 구매 아이템 타입 */
export interface DirectPurchaseItem {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedColor?: {
    colorIndex: number;
    colorName: string;
  };
}

/** 구매 타입 */
export type PurchaseType = 'direct' | 'cart';

/** 구매 액션 결과 */
export interface PurchaseActionResult {
  success: boolean;
  message: string;
  data?: {
    orderId?: number;
    redirectUrl?: string;
  };
}

/** 주문 API 응답 타입 */
export type OrderApiResponse = ApiRes<Order>;
export type OrderListApiResponse = ApiRes<Order[]>;
export type CreateOrderApiResponse = ApiRes<Order>;

/** 결제 페이지로 전달할 주문 데이터 */
export interface OrderPageData {
  type: PurchaseType;
  items: DirectPurchaseItem[];
  totalAmount: number;
  shippingFee: number;
  address?: {
    name: string;
    phone: string;
    address: string;
    detailAddress?: string;
    zipCode?: string;
  };
  memo?: string;
}
